import { type ComponentProps, type PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMousePositionOverElement, usePointerUpHandler } from "$/components/hooks";
import { COMMON_EVENT_TRACKS } from "$/constants";
import { clearSelectionBox, commitSelection, drawSelectionBox, moveMouseAcrossEventsGrid } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDurationInBeats, selectEventEditorEditMode, selectEventEditorRowHeight, selectEventEditorSelectedBeat, selectEventEditorSelectionBox, selectEventEditorStartAndEndBeat, selectEventEditorToggleMirror, selectIsLoading, selectOffsetInBeats, selectSnapTo } from "$/store/selectors";
import { App, EventEditMode, type IEventTrack, type SongId } from "$/types";
import { clamp, normalize, range, roundToNearest } from "$/utils";

import { Stack, styled } from "$:styled-system/jsx";
import { center, hstack, stack } from "$:styled-system/patterns";
import { Button } from "$/components/ui/compositions";
import { useParentDimensions } from "$/components/ui/hooks/use-parent-dimensions";
import EventGridCursor from "./cursor";
import EventGridTimeline from "./header";
import EventGridMarkers from "./markers";
import EventSelectionBox from "./selection-box";
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
	tracks?: IEventTrack[];
}
function EventsGrid({ sid, tracks = COMMON_EVENT_TRACKS, ...rest }: Props) {
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedBeat = useAppSelector((state) => {
		const selectedBeat = selectEventEditorSelectedBeat(state);
		const offsetInBeats = -selectOffsetInBeats(state, sid);
		return selectedBeat !== null ? clamp(selectedBeat, offsetInBeats, (duration ?? selectedBeat) + offsetInBeats) : null;
	});
	const isLoading = useAppSelector(selectIsLoading);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);
	const snapTo = useAppSelector(selectSnapTo);
	const selectionBox = useAppSelector(selectEventEditorSelectionBox);
	const rowHeight = useAppSelector(selectEventEditorRowHeight);
	const dispatch = useAppDispatch();
	const [dimensions, container] = useParentDimensions<HTMLDivElement>();

	const beatNums = useMemo(() => range(Math.floor(startBeat), Math.ceil(endBeat)), [startBeat, endBeat]);

	const [mouseDownAt, setMouseDownAt] = useState<{ x: number; y: number } | null>(null);
	const mouseButtonDepressed = useRef<"left" | "middle" | "right" | null>(null);

	const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		setMouseDownAt(null);
		mousePositionRef.current = null;
		dispatch(clearSelectionBox());
	}, [dispatch]);

	const handleCompleteSelection = useCallback(() => {
		mouseButtonDepressed.current = null;
		setMouseDownAt(null);

		dispatch(commitSelection());
	}, [dispatch]);

	const shouldCompleteSelectionOnPointerUp = useMemo(() => selectedEditMode === EventEditMode.SELECT && !!mouseDownAt, [selectedEditMode, mouseDownAt]);

	usePointerUpHandler(shouldCompleteSelectionOnPointerUp, handleCompleteSelection);

	const tracksScrollContainer = useRef<HTMLDivElement>(null);

	const tracksSelectionBoxRef = useMousePositionOverElement<HTMLDivElement>(tracksScrollContainer, (ref, x, y) => {
		const currentMousePosition = { x, y };
		mousePositionRef.current = currentMousePosition;

		const hoveringOverBeatNum = convertMousePositionToBeatNum(x, dimensions.width, beatNums, startBeat, snapTo);

		const offset = {
			x: -PREFIX_WIDTH, // prefix width
			y: ref.scrollTop - HEADER_HEIGHT,
		};

		if (selectedEditMode === EventEditMode.SELECT && mouseDownAt && mouseButtonDepressed.current === "left") {
			const newSelectionBox = {
				top: Math.min(mouseDownAt.y, currentMousePosition.y) + offset.y,
				left: Math.min(mouseDownAt.x, currentMousePosition.x) + offset.x,
				right: Math.max(mouseDownAt.x, currentMousePosition.x) + offset.x,
				bottom: Math.max(mouseDownAt.y, currentMousePosition.y) + offset.y,
			};

			// Selection boxes need to include their cartesian values, in pixels, but we should also encode the values in business terms: start/end beat, and start/end track
			const startTrackIndex = Math.floor(newSelectionBox.top / rowHeight);
			const endTrackIndex = Math.floor(newSelectionBox.bottom / rowHeight);

			const start = convertMousePositionToBeatNum(newSelectionBox.left, dimensions.width, beatNums, startBeat);

			const end = convertMousePositionToBeatNum(newSelectionBox.right, dimensions.width, beatNums, startBeat);

			const newSelectionBoxInBeats = {
				startTrackIndex,
				endTrackIndex,
				startBeat: start,
				endBeat: end,
			};

			dispatch(drawSelectionBox({ tracks, selectionBox: newSelectionBox, selectionBoxInBeats: newSelectionBoxInBeats }));
		}

		if (hoveringOverBeatNum !== selectedBeat) dispatch(moveMouseAcrossEventsGrid({ selectedBeat: hoveringOverBeatNum }));
	});

	const mousePositionInPx = useMemo(() => {
		return selectedBeat !== null ? normalize(selectedBeat - startBeat, 0, beatNums.length, 0, dimensions.width) : 0;
	}, [selectedBeat, startBeat, beatNums, dimensions.width]);

	const handlePointerDown = useCallback<PointerEventHandler>((ev) => {
		if (ev.button === 0) {
			mouseButtonDepressed.current = "left";
		} else if (ev.button === 2) {
			mouseButtonDepressed.current = "right";
		} else {
			// TODO: Middle button support?
			mouseButtonDepressed.current = "left";
		}

		setMouseDownAt(mousePositionRef.current);
	}, []);

	const isTrackDisabled = useCallback(
		(trackId: App.TrackId) => {
			if (!areLasersLocked) return false;
			return trackId === App.TrackId[3] || trackId === App.TrackId[13];
		},
		[areLasersLocked],
	);

	return (
		<Wrapper {...rest} ref={tracksScrollContainer} data-loading={isLoading}>
			<HeaderWrapper onContextMenu={(ev) => ev.preventDefault()}>
				<ActionsWrapper>
					<Button variant="subtle" size="sm" disabled>
						Track Visibility
					</Button>
				</ActionsWrapper>
				<TimelineWrapper>
					<EventGridTimeline beatNums={beatNums} />
				</TimelineWrapper>
			</HeaderWrapper>
			<MainWrapper>
				<Stack gap={0} onWheel={(ev) => ev.stopPropagation()}>
					{tracks.map(({ id, label }) => (
						<TrackPrefix key={id} style={{ height: rowHeight }} data-disabled={isTrackDisabled(id)}>
							{label}
						</TrackPrefix>
					))}
				</Stack>
				<GridWrapper editMode={selectedEditMode}>
					<TrackMarkersWrapper ref={container}>
						<EventGridMarkers width={dimensions.width} height={dimensions.height} primaryDivisions={4} />
					</TrackMarkersWrapper>
					<TrackContentsWrapper ref={tracksSelectionBoxRef} onPointerDown={handlePointerDown}>
						{tracks.map(({ id }) => {
							const isDisabled = isTrackDisabled(id);
							return <EventGridTrack key={id} sid={sid} trackId={id} tracks={tracks} width={dimensions.width} height={rowHeight} disabled={isDisabled} />;
						})}
					</TrackContentsWrapper>
					{selectionBox && <EventSelectionBox box={selectionBox} />}
					<EventGridCursor sid={sid} gridWidth={dimensions.width} />
					{typeof mousePositionInPx === "number" && <MouseCursor style={{ left: mousePositionInPx }} />}
				</GridWrapper>
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

const GridWrapper = styled("div", {
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

const MainWrapper = styled("div", {
	base: hstack.raw({
		gap: 0,
		backdropFilter: "blur(4px)",
	}),
});

const TrackPrefix = styled("div", {
	base: hstack.raw({
		width: "170px",
		justify: "flex-end",
		paddingInline: 1,
		position: "relative",
		backgroundColor: { base: undefined, _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderRightWidth: "md",
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
	}),
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

export default EventsGrid;
