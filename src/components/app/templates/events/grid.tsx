import { useParams } from "@tanstack/react-router";
import type { EventType } from "bsmap";
import { type ComponentProps, type PointerEvent, type PointerEventHandler, useCallback, useMemo, useRef, useState } from "react";

import { EventGrid } from "$/components/app/layouts";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { useMousePositionOverElement } from "$/components/hooks/use-mouse-position-over-element";
import { useParentDimensions } from "$/components/hooks/use-parent-dimensions";
import { resolveEventType } from "$/helpers/events.helpers";
import { bulkRemoveEvent, deselectEvent, drawEventSelectionBox, mirrorBasicEvent, removeEvent, selectEvent, updateBasicEvent, updateEventsEditorCursor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDurationInBeats, selectEditorOffsetInBeats, selectEventEditorStartAndEndBeat, selectEventsEditorCursor, selectEventsEditorEditMode, selectEventsEditorMirrorLock, selectEventsEditorTrackHeight, selectEventTracksForEnvironment, selectLoading, selectPacerWait, selectSnap } from "$/store/selectors";
import { type Accept, type App, EventEditMode, type ISelectionBoxInBeats, TrackType } from "$/types";
import { clamp, isMetaKeyPressed, normalize, range, roundToNearest } from "$/utils";
import BasicEventTrack from "./basic-track";

function convertMousePositionToBeatNum(x: number, innerGridWidth: number, beatNums: number[], startBeat: number, snapTo?: number) {
	const positionInBeats = normalize(x, 0, innerGridWidth, 0, beatNums.length);

	let roundedPositionInBeats = positionInBeats;
	if (typeof snapTo === "number") {
		roundedPositionInBeats = roundToNearest(positionInBeats, snapTo);
	}

	return roundedPositionInBeats + startBeat;
}

function EventGridEditor({ ...rest }: ComponentProps<typeof EventGrid.Root>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const dispatch = useAppDispatch();
	const wait = useAppSelector(selectPacerWait);
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);
	const selectedBeat = useAppSelector((state) => {
		const selectedBeat = selectEventsEditorCursor(state);
		const offsetInBeats = -selectEditorOffsetInBeats(state, sid);
		return selectedBeat !== null ? clamp(selectedBeat, offsetInBeats, (duration ?? selectedBeat) + offsetInBeats) : null;
	});
	const isLoading = useAppSelector(selectLoading);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const snapTo = useAppSelector(selectSnap);
	const rowHeight = useAppSelector(selectEventsEditorTrackHeight);

	const beatNums = useMemo(() => Array.from(range(Math.floor(startBeat), Math.ceil(endBeat - 1))), [startBeat, endBeat]);

	const [container, dimensions] = useParentDimensions<SVGSVGElement>();

	const [mouseDownAt, setMouseDownAt] = useState<{ x: number; y: number } | null>(null);
	const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

	const mouseButtonDepressed = useRef<number | null>(null);
	const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

	const [selectionBox, setSelectionBox] = useState<DOMRect | null>(null);
	const [selectionBoxInBeats, setSelectionBoxInBeats] = useState<ISelectionBoxInBeats | null>(null);

	const handleCompleteSelection = useCallback(() => {
		mouseButtonDepressed.current = null;
		setMouseDownAt(null);
		if (!selectionBoxInBeats) return;
		dispatch(drawEventSelectionBox({ songId: sid, tracks, selectionBoxInBeats: selectionBoxInBeats }));
		setSelectionBox(null);
		setSelectionBoxInBeats(null);
	}, [dispatch, sid, selectionBoxInBeats, tracks]);

	useGlobalEventListener("pointerup", handleCompleteSelection, {
		shouldFire: selectedEditMode === EventEditMode.SELECT,
	});

	const [tracksSelectionBoxRef] = useMousePositionOverElement<HTMLDivElement>(
		{
			debouncerOptions: { wait },
			onMouseMove: (event, { x, y }) => {
				mousePositionRef.current = { x, y };

				if (selectedEditMode === EventEditMode.SELECT && mouseDownAt && mouseButtonDepressed.current === 0) {
					const newSelectionBox = {
						left: Math.min(mouseDownAt.x, x),
						right: Math.max(mouseDownAt.x, x),
						top: Math.min(mouseDownAt.y, y),
						bottom: Math.max(mouseDownAt.y, y),
					} as DOMRect;

					setSelectionBox(newSelectionBox);

					// Selection boxes need to include their cartesian values, in pixels, but we should also encode the values in business terms: start/end beat, and start/end track
					setSelectionBoxInBeats({
						startTrackIndex: Math.floor(newSelectionBox.top / rowHeight),
						endTrackIndex: Math.floor(newSelectionBox.bottom / rowHeight),
						startBeat: convertMousePositionToBeatNum(newSelectionBox.left, dimensions.width, beatNums, startBeat),
						endBeat: convertMousePositionToBeatNum(newSelectionBox.right, dimensions.width, beatNums, startBeat),
						// we should also track whether we want the selection box to preserve the existing selection
						withPrevious: isMetaKeyPressed(event),
					});
				}

				const hoveringOverBeatNum = convertMousePositionToBeatNum(x, dimensions.width, beatNums, startBeat, snapTo);

				if (hoveringOverBeatNum !== selectedBeat) {
					dispatch(updateEventsEditorCursor({ selectedBeat: hoveringOverBeatNum }));
				}
			},
		},
		[rowHeight],
	);

	const handleTriggerPointerDown = useCallback<PointerEventHandler>((ev) => {
		mouseButtonDepressed.current = ev.button;
		setMouseDownAt(mousePositionRef.current);
	}, []);
	const handleTriggerPointerUp = useCallback<PointerEventHandler>((_) => {
		mouseButtonDepressed.current = null;
		setMouseDownAt(null);
	}, []);

	const handleTrackPointerOver = useCallback((_event: PointerEvent, trackId: Accept<EventType, number>) => {
		setHoveredTrack(trackId);
	}, []);
	const handleTrackPointerOut = useCallback((_event: PointerEvent, _trackId: Accept<EventType, number>) => {
		setHoveredTrack(null);
	}, []);

	const handleEventPointerDown = useCallback(
		(event: PointerEvent, data: App.IBasicEvent) => {
			// When in "select" mode, clicking the grid creates a selection box. We don't want to do that when the user clicks directly on a block.
			// In "place" mode, we need the event to propagate to enable bulk delete.
			if (selectedEditMode === EventEditMode.SELECT) {
				event.stopPropagation();
			}
			switch (event.button) {
				case 0: {
					const action = data.selected ? deselectEvent : selectEvent;
					return dispatch(action({ query: data, tracks, areLasersLocked }));
				}
				case 1: {
					return dispatch(mirrorBasicEvent({ query: data, tracks, areLasersLocked }));
				}
				case 2: {
					return dispatch(removeEvent({ query: data, tracks, areLasersLocked }));
				}
			}
		},
		[dispatch, tracks, areLasersLocked, selectedEditMode],
	);

	const handleEventPointerOver = useCallback(
		(_: PointerEvent, data: App.IBasicEvent) => {
			if (selectedEditMode === EventEditMode.PLACE && mouseButtonDepressed.current === 2) {
				dispatch(bulkRemoveEvent({ query: data, tracks, areLasersLocked }));
			}
		},
		[dispatch, tracks, areLasersLocked, selectedEditMode],
	);

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: App.IBasicEvent) => {
			if (selectedBeat === data.time && hoveredTrack === data.type) {
				const delta = event.deltaY > 0 ? -1 : 1;
				switch (resolveEventType(data, tracks)) {
					case TrackType.LIGHT: {
						const step = data.floatValue + 0.125 / delta;
						const newFloatValue = clamp(step, 0, Number.POSITIVE_INFINITY);
						return dispatch(updateBasicEvent({ query: data, tracks, areLasersLocked, changes: { floatValue: newFloatValue } }));
					}
					case TrackType.VALUE: {
						const step = data.value + 1 / delta;
						const newValue = clamp(step, 0, Number.POSITIVE_INFINITY);
						return dispatch(updateBasicEvent({ query: data, tracks, areLasersLocked, changes: { value: newValue } }));
					}
					default: {
						return;
					}
				}
			}
		},
		[dispatch, tracks, areLasersLocked, selectedBeat, hoveredTrack],
	);

	const handleEventWheel = useCallback(
		(event: WheelEvent, data: App.IBasicEvent) => {
			event.stopPropagation();
			if (event.altKey) {
				resolveWheelAction(event, data);
			}
		},
		[resolveWheelAction],
	);

	return (
		<EventGrid.Root {...rest} aria-busy={isLoading}>
			<EventGrid.Header onContextMenu={(ev) => ev.preventDefault()}>
				<EventGrid.Actions />
				<EventGrid.Timeline beatNums={beatNums} />
			</EventGrid.Header>
			<EventGrid.Body>
				<EventGrid.PrefixGroup onWheel={(ev) => ev.stopPropagation()}>
					<EventGrid.ForTracks>
						{(track, id, { disabled, style }) => (
							<EventGrid.Prefix key={id} style={style} aria-disabled={disabled} onContextMenu={(ev) => ev.preventDefault()}>
								{track.label}
							</EventGrid.Prefix>
						)}
					</EventGrid.ForTracks>
				</EventGrid.PrefixGroup>
				<EventGrid.Control editMode={selectedEditMode}>
					<EventGrid.Markers ref={container} width={dimensions.width} height={dimensions.height} primaryDivisions={4} />
					<EventGrid.Trigger ref={tracksSelectionBoxRef} onPointerDown={handleTriggerPointerDown} onPointerUp={handleTriggerPointerUp}>
						<EventGrid.ForTracks>
							{(_, id, { disabled, style }) => (
								<BasicEventTrack
									key={id}
									trackId={id}
									width={dimensions.width}
									style={style}
									disabled={disabled}
									onPointerOver={(ev) => handleTrackPointerOver(ev, id)}
									onPointerOut={(ev) => handleTrackPointerOut(ev, id)}
									onEventPointerDown={handleEventPointerDown}
									onEventPointerOver={handleEventPointerOver}
									onEventWheel={handleEventWheel}
								/>
							)}
						</EventGrid.ForTracks>
					</EventGrid.Trigger>
					<EventGrid.SelectionBox box={selectionBox} />
					<EventGrid.Cursor gridWidth={dimensions.width} />
					<EventGrid.Pointer width={dimensions.width} />
				</EventGrid.Control>
			</EventGrid.Body>
		</EventGrid.Root>
	);
}

export default EventGridEditor;
