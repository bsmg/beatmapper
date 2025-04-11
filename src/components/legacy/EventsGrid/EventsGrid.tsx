import { type PointerEventHandler, useCallback, useEffect, useRef, useState } from "react";

import { COMMON_EVENT_TRACKS } from "$/constants";
import { useMousePositionOverElement, usePointerUpHandler } from "$/hooks";
import { clearSelectionBox, commitSelection, drawSelectionBox, moveMouseAcrossEventsGrid } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectDurationInBeats, selectEventEditorEditMode, selectEventEditorRowHeight, selectEventEditorSelectedBeat, selectEventEditorSelectionBox, selectEventEditorStartAndEndBeat, selectEventEditorToggleMirror, selectIsLoading, selectOffsetInBeats, selectSnapTo } from "$/store/selectors";
import { App, EventEditMode, type IEventTrack, TrackType } from "$/types";
import { clamp, normalize, range, roundToNearest } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { flex, hstack, stack } from "$:styled-system/patterns";
import BackgroundLines from "./BackgroundLines";
import BlockTrack from "./BlockTrack";
import CursorPositionIndicator from "./CursorPositionIndicator";
import GridHeader from "./GridHeader";
import SelectionBox from "./SelectionBox";
import SpeedTrack from "./SpeedTrack";

function convertMousePositionToBeatNum(x: number, innerGridWidth: number, beatNums: number[], startBeat: number, snapTo?: number) {
	const positionInBeats = normalize(x, 0, innerGridWidth, 0, beatNums.length);

	let roundedPositionInBeats = positionInBeats;
	if (typeof snapTo === "number") {
		roundedPositionInBeats = roundToNearest(positionInBeats, snapTo);
	}

	return roundedPositionInBeats + startBeat;
}

interface Props {
	tracks?: IEventTrack[];
	contentWidth: number;
}

const EventsGrid = ({ tracks = COMMON_EVENT_TRACKS, contentWidth }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const duration = useAppSelector((state) => selectDurationInBeats(state, songId));
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, songId));
	const numOfBeatsToShow = endBeat - startBeat;
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedBeat = useAppSelector((state) => {
		const selectedBeat = selectEventEditorSelectedBeat(state);
		const offsetInBeats = -selectOffsetInBeats(state, songId);
		return selectedBeat !== null ? clamp(selectedBeat, offsetInBeats, (duration ?? selectedBeat) + offsetInBeats) : null;
	});
	const isLoading = useAppSelector(selectIsLoading);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);
	const snapTo = useAppSelector(selectSnapTo);
	const selectionBox = useAppSelector(selectEventEditorSelectionBox);
	const rowHeight = useAppSelector(selectEventEditorRowHeight);
	const dispatch = useAppDispatch();

	const innerGridWidth = contentWidth - PREFIX_WIDTH;

	const headerHeight = 32;
	const innerGridHeight = rowHeight * tracks.length;

	const beatNums = range(Math.floor(startBeat), Math.ceil(endBeat));

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

	const shouldCompleteSelectionOnPointerUp = selectedEditMode === EventEditMode.SELECT && !!mouseDownAt;

	usePointerUpHandler(shouldCompleteSelectionOnPointerUp, handleCompleteSelection);

	const tracksRef = useMousePositionOverElement<HTMLDivElement>((x, y) => {
		const currentMousePosition = { x, y };
		mousePositionRef.current = currentMousePosition;

		const hoveringOverBeatNum = convertMousePositionToBeatNum(x, innerGridWidth, beatNums, startBeat, snapTo);

		if (selectedEditMode === EventEditMode.SELECT && mouseDownAt && mouseButtonDepressed.current === "left") {
			const newSelectionBox = {
				top: Math.min(mouseDownAt.y, currentMousePosition.y),
				left: Math.min(mouseDownAt.x, currentMousePosition.x),
				right: Math.max(mouseDownAt.x, currentMousePosition.x),
				bottom: Math.max(mouseDownAt.y, currentMousePosition.y),
			};

			// Selection boxes need to include their cartesian values, in pixels, but we should also encode the values in business terms: start/end beat, and start/end track
			const startTrackIndex = Math.floor(newSelectionBox.top / rowHeight);
			const endTrackIndex = Math.floor(newSelectionBox.bottom / rowHeight);

			const start = convertMousePositionToBeatNum(newSelectionBox.left, innerGridWidth, beatNums, startBeat);

			const end = convertMousePositionToBeatNum(newSelectionBox.right, innerGridWidth, beatNums, startBeat);

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

	const mousePositionInPx = selectedBeat !== null ? normalize(selectedBeat - startBeat, 0, beatNums.length, 0, innerGridWidth) : 0;

	const handlePointerDown: PointerEventHandler = (ev) => {
		if (ev.button === 0) {
			mouseButtonDepressed.current = "left";
		} else if (ev.button === 2) {
			mouseButtonDepressed.current = "right";
		} else {
			// TODO: Middle button support?
			mouseButtonDepressed.current = "left";
		}

		setMouseDownAt(mousePositionRef.current);
	};

	const getIsTrackDisabled = (trackId: App.TrackId) => {
		if (!areLasersLocked) {
			return false;
		}

		return trackId === App.TrackId[3] || trackId === App.TrackId[13];
	};

	return (
		<Wrapper data-loading={isLoading} style={{ width: contentWidth }}>
			<PrefixColumn
				style={{ width: PREFIX_WIDTH }}
				onContextMenu={(ev) => {
					// I often accidentally right-click the prefix when trying to delete notes near the start of the window. Avoid this problem.
					ev.preventDefault();
				}}
			>
				<TopLeftBlankCell style={{ height: headerHeight }} />

				{tracks.map(({ id, label }) => (
					<TrackPrefix key={id} style={{ height: rowHeight }} data-disabled={getIsTrackDisabled(id)}>
						{label}
					</TrackPrefix>
				))}
			</PrefixColumn>

			<Grid>
				<GridHeader height={headerHeight} beatNums={beatNums} selectedBeat={selectedBeat} />

				<MainGridContent
					style={{
						height: innerGridHeight,
						cursor: selectedEditMode === EventEditMode.SELECT ? "crosshair" : "pointer",
					}}
				>
					<BackgroundLinesWrapper>
						<BackgroundLines width={innerGridWidth} height={innerGridHeight} numOfBeatsToShow={numOfBeatsToShow} primaryDivisions={4} secondaryDivisions={0} />
					</BackgroundLinesWrapper>

					<Tracks ref={tracksRef} onPointerDown={handlePointerDown}>
						{tracks.map(({ id, type }) => {
							const TrackComponent = type === TrackType.VALUE ? SpeedTrack : BlockTrack;

							const isDisabled = getIsTrackDisabled(id);

							return <TrackComponent key={id} trackId={id} tracks={tracks} width={innerGridWidth} height={rowHeight} startBeat={startBeat} numOfBeatsToShow={numOfBeatsToShow} cursorAtBeat={selectedBeat} isDisabled={isDisabled} areLasersLocked={areLasersLocked} />;
						})}
					</Tracks>

					{selectionBox && <SelectionBox box={selectionBox} />}

					<CursorPositionIndicator gridWidth={innerGridWidth} startBeat={startBeat} endBeat={endBeat} zIndex={LAYERS.songPositionIndicator} />

					{typeof mousePositionInPx === "number" && <MouseCursor style={{ left: mousePositionInPx }} />}
				</MainGridContent>
			</Grid>
		</Wrapper>
	);
};

const LAYERS = {
	background: 0,
	mouseCursor: 1,
	tracks: 2,
	songPositionIndicator: 3,
};

const PREFIX_WIDTH = 170;

const Wrapper = styled("div", {
	base: flex.raw({
		opacity: { base: 1, _loading: 0.25 },
		pointerEvents: { base: "auto", _loading: "none" },
		userSelect: "none",
	}),
});

const PrefixColumn = styled("div", {
	base: {
		width: "170px",
	},
});

const Grid = styled("div", {
	base: stack.raw({
		flex: 1,
		gap: 0,
	}),
});

const TopLeftBlankCell = styled("div", {
	base: {
		borderBottomWidth: "sm",
		borderColor: "border.muted",
	},
});

const MainGridContent = styled("div", {
	base: {
		position: "relative",
		flex: 1,
	},
});

const BackgroundLinesWrapper = styled("div", {
	base: {
		position: "absolute",
		zIndex: LAYERS.background,
		inset: 0,
	},
});

const TrackPrefix = styled("div", {
	base: hstack.raw({
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

const Tracks = styled("div", {
	base: {
		position: "relative",
		zIndex: LAYERS.tracks,
	},
});

const MouseCursor = styled("div", {
	base: {
		position: "absolute",
		top: 0,
		zIndex: LAYERS.mouseCursor,
		width: "4px",
		height: "100%",
		background: "fg.default",
		borderWidth: "sm",
		borderColor: "border.default",
		pointerEvents: "none",
		transform: "translateX(-2px)",
	},
});

export default EventsGrid;
