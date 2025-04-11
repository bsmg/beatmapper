import { type PointerEventHandler, useCallback, useState } from "react";

import { token } from "$:styled-system/tokens";
import { useMousePositionOverElement, usePointerUpHandler } from "$/hooks";
import { changeLaserSpeed } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrackInWindow, selectDurationInBeats, selectEventEditorEditMode, selectOffsetInBeats, selectValueForTrackAtBeat } from "$/store/selectors";
import { type App, EventEditMode } from "$/types";
import { clamp, normalize, range } from "$/utils";
import { getYForSpeed } from "./EventsGrid.helpers";

import { styled } from "$:styled-system/jsx";
import SpeedTrackEvent from "./SpeedTrackEvent";

const NUM_OF_SPEEDS = 7;
const INITIAL_TENTATIVE_EVENT = {
	id: "tentative",
	beatNum: null as number | null,
	laserSpeed: null as number | null,
	visible: false,
} as Partial<App.IBasicValueEvent> & { visible: boolean };

interface Props {
	trackId: App.TrackId;
	width: number;
	height: number;
	startBeat: number;
	numOfBeatsToShow: number;
	cursorAtBeat: number | null;
	isDisabled?: boolean;
	areLasersLocked: boolean;
}

const SpeedTrack = ({ trackId, width, height, startBeat, numOfBeatsToShow, cursorAtBeat, isDisabled, areLasersLocked }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const duration = useAppSelector((state) => selectDurationInBeats(state, songId));
	const offsetInBeats = useAppSelector((state) => -selectOffsetInBeats(state, songId));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, trackId) as App.IBasicValueEvent[]);
	const startSpeed = useAppSelector((state) => selectValueForTrackAtBeat(state, { trackId, beforeBeat: startBeat }));
	const endSpeed = useAppSelector((state) => selectValueForTrackAtBeat(state, { trackId, beforeBeat: startBeat + numOfBeatsToShow }));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const dispatch = useAppDispatch();
	const [tentativeEvent, setTentativeEvent] = useState(INITIAL_TENTATIVE_EVENT);

	const commitChanges = useCallback(() => {
		if (!tentativeEvent.beatNum || !tentativeEvent.laserSpeed) return;
		dispatch(changeLaserSpeed({ trackId, beatNum: tentativeEvent.beatNum, speed: tentativeEvent.laserSpeed, areLasersLocked }));

		setTentativeEvent(INITIAL_TENTATIVE_EVENT);
	}, [trackId, tentativeEvent, areLasersLocked, dispatch]);

	usePointerUpHandler(tentativeEvent.visible, commitChanges);

	const ref = useMousePositionOverElement<HTMLDivElement>(
		(_, y) => {
			// We don't care about x, since we already have that under `cursorAtBeat`. We need to know which vertical bar they're closest to.
			// `y` will be a number from 0 to `height`, where 0 is the top and `height` is the bottom. Start by flipping this, since we want speed to increase from bottom to top.
			const invertedY = height - y;
			const speed = Math.ceil(invertedY / (NUM_OF_SPEEDS - 2));

			if (speed !== tentativeEvent.laserSpeed) {
				setTentativeEvent({
					...tentativeEvent,
					laserSpeed: speed,
				});
			}
		},
		{ boxDependencies: [height] },
	);

	const handlePointerDown: PointerEventHandler = (ev) => {
		if (cursorAtBeat === null) return;
		if (isDisabled) {
			return;
		}

		if (ev.button !== 0 || selectedEditMode !== EventEditMode.PLACE) {
			return;
		}

		const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);

		setTentativeEvent({
			...tentativeEvent,
			beatNum: beatNum,
			visible: true,
		});
	};

	const plottablePoints = [
		{
			x: 0,
			y: getYForSpeed(height, startSpeed),
		},
	];

	for (const event of events) {
		const previousY = plottablePoints[plottablePoints.length - 1].y;

		const x = normalize(event.beatNum, startBeat, startBeat + numOfBeatsToShow, 0, width);

		plottablePoints.push(
			{
				x: x,
				y: previousY,
			},
			{
				x: x,
				y: getYForSpeed(height, event.laserSpeed),
			},
		);
	}

	plottablePoints.push(
		{
			x: width,
			y: getYForSpeed(height, endSpeed),
		},
		{
			x: width,
			y: height,
		},
		{
			x: 0,
			y: height,
		},
	);

	return (
		<Wrapper ref={ref} style={{ height }} data-disabled={isDisabled} onPointerDown={handlePointerDown} onContextMenu={(ev) => ev.preventDefault()}>
			<svg width={width} height={height}>
				{/* Background 8 vertical lines, indicating the "levels" */}
				{!isDisabled && (
					<g>
						{range(NUM_OF_SPEEDS + 1).map((i) => (
							<line key={i} x1={0} y1={getYForSpeed(height, i)} x2={width} y2={getYForSpeed(height, i)} strokeWidth={1} stroke={token.var("colors.border.subtle")} style={{ opacity: 0.6 }} />
						))}
					</g>
				)}

				{/*
          The fill for our graph area, showing easily where the current speed
          is at.
        */}
				<polyline
					points={plottablePoints.reduce((acc, point) => {
						return `${acc} ${point.x},${point.y}`;
					}, "")}
					stroke="white"
					strokeWidth="0.2"
					fill={token.var("colors.green.500")}
					opacity={0.5}
				/>

				{/* We also want to add little circles on every event. This'll allow the user to drag and change the position of events, as well as delete events they no longer want */}
				{events.map((event) => (
					<SpeedTrackEvent key={event.id} event={event} trackId={trackId} startBeat={startBeat} endBeat={startBeat + numOfBeatsToShow} parentWidth={width} parentHeight={height} areLasersLocked={areLasersLocked} />
				))}

				{tentativeEvent.visible && <SpeedTrackEvent event={tentativeEvent as App.IBasicValueEvent} trackId={trackId} startBeat={startBeat} endBeat={startBeat + numOfBeatsToShow} parentWidth={width} parentHeight={height} areLasersLocked={areLasersLocked} />}
			</svg>
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		position: "relative",
		backgroundColor: { base: undefined, _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
	},
});

export default SpeedTrack;
