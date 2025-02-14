import { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { COLORS } from "$/constants";
import { usePointerUpHandler } from "$/hooks";
import { bulkPlaceEvent, placeEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrackInWindow, selectDurationInBeats, selectEventEditorColor, selectEventEditorEditMode, selectEventEditorTool, selectInitialColorForTrack, selectOffsetInBeats } from "$/store/selectors";
import { App, EventEditMode, EventTool, type IEventTrack } from "$/types";
import { clamp } from "$/utils";
import { getBackgroundBoxes } from "./BlockTrack.helpers";

import BackgroundBox from "./BackgroundBox";
import EventBlock from "./EventBlock";

interface Props {
	trackId: App.TrackId;
	tracks?: IEventTrack[];
	width: number;
	height: number;
	startBeat: number;
	numOfBeatsToShow: number;
	cursorAtBeat: number | null;
	areLasersLocked: boolean;
	isDisabled: boolean;
}

const BlockTrack = ({ trackId, tracks, width, height, startBeat, numOfBeatsToShow, cursorAtBeat, areLasersLocked, isDisabled }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const duration = useAppSelector((state) => selectDurationInBeats(state, songId));
	const offsetInBeats = useAppSelector((state) => -selectOffsetInBeats(state, songId));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, trackId));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedTool = useAppSelector(selectEventEditorTool);
	const selectedColorType = useAppSelector(selectEventEditorColor);
	const initialTrackLightingColorType = useAppSelector((state) => selectInitialColorForTrack(state, trackId));
	const dispatch = useAppDispatch();

	const [mouseButtonDepressed, setMouseButtonDepressed] = useState<"left" | "right" | null>(null);

	const handlePointerUp = useCallback(() => {
		setMouseButtonDepressed(null);
	}, []);

	usePointerUpHandler(!!mouseButtonDepressed, handlePointerUp);

	const getPropsForPlacedEvent = useCallback(() => {
		const isRingEvent = trackId === App.TrackId[8] || trackId === App.TrackId[9];
		const eventType = isRingEvent ? App.BasicEventType.TRIGGER : selectedTool;

		let eventColorType = selectedColorType as App.EventColor | undefined;
		if (isRingEvent || selectedTool === EventTool.OFF) {
			eventColorType = undefined;
		}

		return { trackId, eventType, eventColorType, eventLaserSpeed: undefined, areLasersLocked };
	}, [areLasersLocked, selectedColorType, selectedTool, trackId]);

	const handleClickTrack = () => {
		if (cursorAtBeat === null) return;
		const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);
		return dispatch(placeEvent({ beatNum: beatNum, ...getPropsForPlacedEvent() }));
	};

	useEffect(() => {
		if (selectedEditMode === EventEditMode.PLACE && mouseButtonDepressed === "left") {
			if (cursorAtBeat !== null) {
				const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);
				dispatch(bulkPlaceEvent({ beatNum: beatNum, ...getPropsForPlacedEvent() }));
			}
		}
	}, [dispatch, getPropsForPlacedEvent, cursorAtBeat, duration, offsetInBeats, mouseButtonDepressed, selectedEditMode]);

	const backgroundBoxes = getBackgroundBoxes(events, trackId, initialTrackLightingColorType ?? null, startBeat, numOfBeatsToShow, tracks);

	return (
		<Wrapper
			style={{ height }}
			isDisabled={isDisabled}
			onPointerDown={(ev) => {
				if (isDisabled || selectedEditMode === EventEditMode.SELECT) {
					return;
				}

				if (ev.buttons === 1) {
					handleClickTrack();
					setMouseButtonDepressed("left");
				} else if (ev.buttons === 2) {
					setMouseButtonDepressed("right");
				}
			}}
			onContextMenu={(ev) => ev.preventDefault()}
		>
			{backgroundBoxes.map((box) => (
				<BackgroundBox key={box.id} box={box} startBeat={startBeat} numOfBeatsToShow={numOfBeatsToShow} />
			))}

			{events.map((event) => {
				return <EventBlock key={event.id} event={event} trackWidth={width} startBeat={startBeat} numOfBeatsToShow={numOfBeatsToShow} deleteOnHover={selectedEditMode === EventEditMode.PLACE && mouseButtonDepressed === "right"} areLasersLocked={areLasersLocked} />;
			})}
		</Wrapper>
	);
};

const Wrapper = styled.div<{ isDisabled?: boolean }>`
  position: relative;
  border-bottom: 1px solid ${COLORS.blueGray[400]};
  opacity: ${(p) => p.isDisabled && 0.5};
  cursor: ${(p) => p.isDisabled && "not-allowed"};
  background-color: ${(p) => p.isDisabled && "rgba(255,255,255,0.2)"};

  &:last-of-type {
    border-bottom: none;
  }
`;

export default memo(BlockTrack);
