import type { EventType } from "bsmap";
import { type ComponentProps, type PointerEvent, type PointerEventHandler, useCallback, useMemo, useRef, useState } from "react";

import { useGlobalEventListener, useMousePositionOverElement, useParentDimensions } from "$/components/hooks";
import { isSideTrack, resolveEventType } from "$/helpers/events.helpers";
import { bulkRemoveEvent, deselectEvent, drawEventSelectionBox, mirrorBasicEvent, removeEvent, selectEvent, updateBasicEvent, updateEventsEditorCursor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDurationInBeats, selectEditorOffsetInBeats, selectEventEditorStartAndEndBeat, selectEventsEditorCursor, selectEventsEditorEditMode, selectEventsEditorMirrorLock, selectEventsEditorTrackHeight, selectEventTracksForEnvironment, selectLoading, selectSnap } from "$/store/selectors";
import { type Accept, type App, type BeatmapId, EventEditMode, type ISelectionBoxInBeats, type SongId, TrackType } from "$/types";
import { clamp, isMetaKeyPressed, normalize, range, roundToNearest } from "$/utils";
import { styled } from "$:styled-system/jsx";
import { center, hstack, stack } from "$:styled-system/patterns";
import EventGridCursor from "./cursor";
import EventGridMarkers from "./markers";
import EventGridSelectionBox from "./selection-box";
import EventGridTimeline from "./timeline";
import EventGridTrack from "./track";

const PREFIX_WIDTH = 170;
const HEADER_HEIGHT = 32;

function convertMousePositionToBeatNum(x: number, innerGridWidth: number, beatNums: number[], startBeat: number, snapTo?: number) {
	const positionInBeats = normalize(x, 0, innerGridWidth, 0, beatNums.length);

	let roundedPositionInBeats = positionInBeats;
	if (typeof snapTo === "number") {
		roundedPositionInBeats = roundToNearest(positionInBeats, snapTo);
	}

	return roundedPositionInBeats + startBeat;
}

interface Props extends ComponentProps<typeof Wrapper> {
	sid: SongId;
	bid: BeatmapId;
}
function EventGridEditor({ sid, bid, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const allTracks = useMemo(() => Object.entries(tracks), [tracks]);
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

	const [dimensions, container] = useParentDimensions<HTMLDivElement>();
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

	const tracksScrollContainer = useRef<HTMLDivElement>(null);

	const tracksSelectionBoxRef = useMousePositionOverElement<HTMLDivElement>(
		tracksScrollContainer,
		(ref, x, y, event) => {
			const currentMousePosition = { x, y };
			mousePositionRef.current = currentMousePosition;

			const offset = {
				x: -PREFIX_WIDTH, // prefix width
				y: ref.scrollTop - HEADER_HEIGHT,
			};

			const hoveringOverBeatNum = convertMousePositionToBeatNum(x + offset.x, dimensions.width, beatNums, startBeat, snapTo);

			if (selectedEditMode === EventEditMode.SELECT && mouseDownAt && mouseButtonDepressed.current === 0) {
				const newSelectionBox = {
					top: Math.min(mouseDownAt.y, currentMousePosition.y) + offset.y,
					left: Math.min(mouseDownAt.x, currentMousePosition.x) + offset.x,
					right: Math.max(mouseDownAt.x, currentMousePosition.x) + offset.x,
					bottom: Math.max(mouseDownAt.y, currentMousePosition.y) + offset.y,
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

			if (hoveringOverBeatNum !== selectedBeat) dispatch(updateEventsEditorCursor({ selectedBeat: hoveringOverBeatNum }));
		},
		{
			boxDependencies: [rowHeight],
		},
	);

	const mousePositionInPx = useMemo(() => {
		return selectedBeat !== null && selectedBeat - startBeat >= 0 ? normalize(selectedBeat - startBeat, 0, beatNums.length, 0, dimensions.width) : 0;
	}, [selectedBeat, startBeat, beatNums, dimensions.width]);

	const handlePointerDown = useCallback<PointerEventHandler>((ev) => {
		mouseButtonDepressed.current = ev.button;
		setMouseDownAt(mousePositionRef.current);
	}, []);

	const handlePointerUp = useCallback<PointerEventHandler>((_) => {
		mouseButtonDepressed.current = null;
		setMouseDownAt(null);
	}, []);

	const handlePointerOver = useCallback((_: PointerEvent, trackId: Accept<EventType, number>) => {
		setHoveredTrack(trackId);
	}, []);
	const handlePointerOut = useCallback((_: PointerEvent) => {
		setHoveredTrack(null);
	}, []);

	const isTrackDisabled = useCallback(
		(trackId: Accept<EventType, number>) => {
			if (!areLasersLocked) return false;
			return isSideTrack(trackId, "right", tracks);
		},
		[tracks, areLasersLocked],
	);

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
		<Wrapper {...rest} ref={tracksScrollContainer} data-loading={isLoading}>
			<HeaderWrapper onContextMenu={(ev) => ev.preventDefault()}>
				<ActionsWrapper />
				<TimelineWrapper>
					<EventGridTimeline sid={sid} beatNums={beatNums} />
				</TimelineWrapper>
			</HeaderWrapper>
			<MainWrapper>
				<PrefixWrapper onWheel={(ev) => ev.stopPropagation()}>
					{allTracks.map(([id, { label }]) => (
						<Prefix key={id} style={{ height: rowHeight }} data-disabled={isTrackDisabled(Number.parseInt(id))} onContextMenu={(ev) => ev.preventDefault()}>
							{label}
						</Prefix>
					))}
				</PrefixWrapper>
				<TracksWrapper editMode={selectedEditMode}>
					<TrackMarkersWrapper ref={container}>
						<EventGridMarkers width={dimensions.width} height={dimensions.height} primaryDivisions={4} />
					</TrackMarkersWrapper>
					<TrackContentsWrapper ref={tracksSelectionBoxRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
						{allTracks.map(([id]) => {
							const isDisabled = isTrackDisabled(Number.parseInt(id));
							return (
								<EventGridTrack
									key={id}
									sid={sid}
									bid={bid}
									trackId={Number.parseInt(id)}
									width={dimensions.width}
									height={rowHeight}
									disabled={isDisabled}
									onPointerOver={(ev) => handlePointerOver(ev, Number.parseInt(id))}
									onPointerOut={handlePointerOut}
									onEventPointerDown={handleEventPointerDown}
									onEventPointerOver={handleEventPointerOver}
									onEventWheel={handleEventWheel}
								/>
							);
						})}
					</TrackContentsWrapper>
					{selectionBox && <EventGridSelectionBox box={selectionBox} />}
					<EventGridCursor sid={sid} gridWidth={dimensions.width} />
					{typeof mousePositionInPx === "number" && <MouseCursor style={{ left: mousePositionInPx }} />}
				</TracksWrapper>
			</MainWrapper>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		gap: 0,
		opacity: { base: 1, _loading: 0.25 },
		pointerEvents: { base: "auto", _loading: "none" },
		userSelect: "none",
		overflowX: "clip",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

const HeaderWrapper = styled("div", {
	base: hstack.raw({
		position: "sticky",
		height: "32px",
		top: 0,
		gap: 0,
		backdropFilter: "blur(4px)",
		zIndex: 2,
	}),
});

const MainWrapper = styled("div", {
	base: hstack.raw({
		gap: 0,
		backdropFilter: "blur(4px)",
	}),
});

const ActionsWrapper = styled("div", {
	base: center.raw({
		minWidth: "170px",
		height: "100%",
		borderBottomWidth: "sm",
		borderColor: "border.muted",
	}),
});

const TimelineWrapper = styled("div", {
	base: {
		position: "relative",
		height: "100%",
		flex: 1,
	},
});

const PrefixWrapper = styled("div", {
	base: stack.raw({
		gap: 0,
	}),
});

const Prefix = styled("div", {
	base: hstack.raw({
		width: "170px",
		justify: "flex-end",
		textAlign: "end",
		paddingInline: 1,
		position: "relative",
		backgroundColor: { base: undefined, _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderRightWidth: "md",
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
		overflowX: "auto",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		_scrollbar: { display: "none" },
	}),
});

const TracksWrapper = styled("div", {
	base: {
		position: "relative",
		flex: 1,
	},
	variants: {
		editMode: {
			place: { cursor: "pointer" },
			select: { cursor: "crosshair" },
		},
	},
});

const TrackMarkersWrapper = styled("div", {
	base: {
		position: "absolute",
		inset: 0,
	},
});

const TrackContentsWrapper = styled("div", {
	base: {
		position: "relative",
	},
});

const MouseCursor = styled("div", {
	base: {
		position: "absolute",
		top: 0,
		width: "3px",
		height: "100%",
		background: "fg.default",
		borderWidth: "sm",
		borderColor: "border.default",
		pointerEvents: "none",
		transform: "translateX(-1px)",
	},
});

export default EventGridEditor;
