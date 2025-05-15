import { type PointerEvent, memo, useCallback, useEffect, useMemo, useState } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { isTriggerTrack, isValueTrack, resolveEventId } from "$/helpers/events.helpers";
import { bulkPlaceEvent, placeEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrackInWindow,
	selectDurationInBeats,
	selectEditorOffsetInBeats,
	selectEventEditorBeatsPerZoomLevel,
	selectEventEditorColor,
	selectEventEditorEditMode,
	selectEventEditorSelectedBeat,
	selectEventEditorToggleMirror,
	selectEventEditorTool,
	selectEventEditorZoomLevelStartBeat,
	selectInitialColorForTrack,
} from "$/store/selectors";
import { App, type BeatmapId, EventEditMode, type IEventTrack, type SongId } from "$/types";
import { clamp, normalize } from "$/utils";
import { createBackgroundBoxes } from "./track.helpers";

import { styled } from "$:styled-system/jsx";
import EventGridBackgroundBox from "./background-box";
import EventGridEventItem from "./event";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	trackId: App.TrackId;
	tracks?: IEventTrack[];
	width: number;
	height: number;
	disabled: boolean;
}
function EventGridTrack({ sid, bid, trackId, tracks, width, height, disabled }: Props) {
	const dispatch = useAppDispatch();
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const cursorAtBeat = useAppSelector(selectEventEditorSelectedBeat);
	const startBeat = useAppSelector((state) => selectEventEditorZoomLevelStartBeat(state, sid));
	const numOfBeatsToShow = useAppSelector((state) => selectEventEditorBeatsPerZoomLevel(state));
	const offsetInBeats = useAppSelector((state) => -selectEditorOffsetInBeats(state, sid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, trackId));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedTool = useAppSelector(selectEventEditorTool);
	const selectedColorType = useAppSelector(selectEventEditorColor);
	const initialTrackLightingColorType = useAppSelector((state) => selectInitialColorForTrack(state, trackId));
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);

	const [mouseButtonDepressed, setMouseButtonDepressed] = useState<"left" | "right" | null>(null);

	const handlePointerUp = useCallback(() => {
		setMouseButtonDepressed(null);
	}, []);

	useGlobalEventListener("pointerup", handlePointerUp, {
		shouldFire: !!mouseButtonDepressed,
	});

	const resolveEventData = useCallback(
		(beat: number, eventValue?: number) => {
			if (isTriggerTrack(trackId)) {
				return { beatNum: beat, trackId, eventType: App.BasicEventType.TRIGGER, areLasersLocked };
			}
			if (isValueTrack(trackId)) {
				const value = isValueTrack(trackId) ? (eventValue ?? 0) : undefined;
				return { beatNum: beat, trackId, eventType: App.BasicEventType.VALUE, eventLaserSpeed: value, areLasersLocked };
			}
			return { beatNum: beat, trackId, eventType: selectedTool, eventColorType: selectedColorType, areLasersLocked };
		},
		[areLasersLocked, selectedColorType, selectedTool, trackId],
	);

	const handleClickTrack = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			if (disabled || selectedEditMode === EventEditMode.SELECT) {
				return;
			}

			if (ev.buttons === 1) {
				setMouseButtonDepressed("left");
				if (cursorAtBeat === null) return;
				const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);
				const normY = ev.nativeEvent.offsetY / ev.currentTarget.clientHeight;
				const value = Math.round(normalize(normY, 0, 1, 8, 0));
				return dispatch(placeEvent(resolveEventData(beatNum, value)));
			}
			if (ev.buttons === 2) {
				setMouseButtonDepressed("right");
			}
		},
		[dispatch, resolveEventData, disabled, selectedEditMode, cursorAtBeat, offsetInBeats, duration],
	);

	useEffect(() => {
		if (selectedEditMode === EventEditMode.PLACE && mouseButtonDepressed === "left" && !isValueTrack(trackId)) {
			if (cursorAtBeat !== null) {
				const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);
				dispatch(bulkPlaceEvent(resolveEventData(beatNum)));
			}
		}
	}, [dispatch, resolveEventData, trackId, cursorAtBeat, duration, offsetInBeats, mouseButtonDepressed, selectedEditMode]);

	const backgroundBoxes = useMemo(() => {
		return createBackgroundBoxes(events, trackId, initialTrackLightingColorType ?? null, startBeat, numOfBeatsToShow, tracks);
	}, [events, trackId, initialTrackLightingColorType, startBeat, numOfBeatsToShow, tracks]);

	const styles = useMemo(() => ({ height }), [height]);

	return (
		<Wrapper key={trackId} style={styles} data-disabled={disabled} onPointerDown={handleClickTrack} onContextMenu={(ev) => ev.preventDefault()}>
			{backgroundBoxes.map((box) => (
				<EventGridBackgroundBox key={resolveEventId({ type: trackId, time: box.beatNum })} sid={sid} bid={bid} box={box} />
			))}
			{events.map((event) => {
				return <EventGridEventItem key={resolveEventId(event)} sid={sid} bid={bid} event={event} trackWidth={width} deleteOnHover={selectedEditMode === EventEditMode.PLACE && mouseButtonDepressed === "right"} />;
			})}
		</Wrapper>
	);
}

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

export default memo(EventGridTrack);
