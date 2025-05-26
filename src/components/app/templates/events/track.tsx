import { type EventType, createBasicEvent } from "bsmap";
import { type ComponentProps, type PointerEvent, memo, useCallback, useEffect, useMemo, useState } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { resolveEventId, resolveEventValue, resolveTrackType } from "$/helpers/events.helpers";
import { bulkAddBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrackInWindow,
	selectDurationInBeats,
	selectEditorOffsetInBeats,
	selectEventEditorStartAndEndBeat,
	selectEventTracksForEnvironment,
	selectEventsEditorColor,
	selectEventsEditorCursor,
	selectEventsEditorEditMode,
	selectEventsEditorMirrorLock,
	selectEventsEditorTool,
	selectInitialStateForTrack,
} from "$/store/selectors";
import { type Accept, App, type BeatmapId, EventEditMode, type SongId, TrackType } from "$/types";
import { clamp, normalize } from "$/utils";
import { createBackgroundBoxes } from "./track.helpers";

import { styled } from "$:styled-system/jsx";
import EventGridBackgroundBox from "./background-box";
import EventGridEventItem from "./event";

interface Props extends ComponentProps<typeof Wrapper> {
	sid: SongId;
	bid: BeatmapId;
	trackId: Accept<EventType, number>;
	width: number;
	height: number;
	disabled: boolean;
	onEventPointerDown?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOut?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOver?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventWheel?: (event: WheelEvent, data: App.IBasicEvent) => void;
}
function EventGridTrack({ sid, bid, trackId, width, height, disabled, onEventPointerDown, onEventPointerOver, onEventPointerOut, onEventWheel, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const cursorAtBeat = useAppSelector(selectEventsEditorCursor);
	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const offsetInBeats = useAppSelector((state) => -selectEditorOffsetInBeats(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, trackId));
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColorType = useAppSelector(selectEventsEditorColor);
	const initialTrackLightingState = useAppSelector((state) => selectInitialStateForTrack(state, trackId));
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);

	const [mouseButtonDepressed, setMouseButtonDepressed] = useState<"left" | "right" | null>(null);
	const [norm, setNorm] = useState<number | null>(null);

	const backgroundBoxes = useMemo(() => {
		const { color, brightness } = initialTrackLightingState;
		return createBackgroundBoxes(events, trackId, { initialColor: color ?? null, initialBrightness: brightness ?? null, startBeat, numOfBeatsToShow, tracks });
	}, [events, trackId, initialTrackLightingState, startBeat, numOfBeatsToShow, tracks]);

	const styles = useMemo(() => ({ height }), [height]);

	const handlePointerUp = useCallback(() => {
		setMouseButtonDepressed(null);
		setNorm(null);
	}, []);

	useGlobalEventListener("pointerup", handlePointerUp, {
		shouldFire: !!mouseButtonDepressed,
	});

	const resolveEventData = useCallback(
		(time: number, norm: number) => {
			const type = resolveTrackType(trackId, tracks);

			switch (type) {
				case TrackType.LIGHT: {
					const value = resolveEventValue({ effect: selectedTool, color: selectedColorType }, { tracks });
					const floatValue = Math.round(normalize(1 - (norm ?? 0), 0, 1, 0, 2)) / 2;
					return { data: createBasicEvent({ time, type: trackId, value: value, floatValue: floatValue }), tracks, areLasersLocked };
				}
				case TrackType.TRIGGER: {
					const value = resolveEventValue({ effect: App.BasicEventEffect.TRIGGER }, { tracks });
					return { data: createBasicEvent({ time, type: trackId, value: value }), tracks, areLasersLocked };
				}
				case TrackType.VALUE: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 8, 0));
					return { data: createBasicEvent({ time, type: trackId, value: value }), tracks, areLasersLocked };
				}
				default: {
					throw new Error(`Unsupported track: ${trackId}`);
				}
			}
		},
		[tracks, areLasersLocked, selectedColorType, selectedTool, trackId],
	);

	const handleClickTrack = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			if (cursorAtBeat === null) return;
			if (disabled || selectedEditMode === EventEditMode.SELECT) return;

			setNorm(ev.nativeEvent.offsetY / ev.currentTarget.clientHeight);

			switch (ev.button) {
				case 0: {
					setMouseButtonDepressed("left");
					break;
				}
				case 2: {
					setMouseButtonDepressed("right");
					break;
				}
			}
		},
		[disabled, selectedEditMode, cursorAtBeat],
	);

	useEffect(() => {
		if (selectedEditMode !== EventEditMode.PLACE || cursorAtBeat === null) return;

		if (mouseButtonDepressed === "left") {
			const beatNum = clamp(cursorAtBeat, offsetInBeats, (duration ?? cursorAtBeat) + offsetInBeats);
			const payload = resolveEventData(beatNum, norm ?? 0);
			dispatch(bulkAddBasicEvent({ ...payload, overwrite: false }));
		}
	}, [dispatch, resolveEventData, cursorAtBeat, norm, duration, offsetInBeats, mouseButtonDepressed, selectedEditMode]);

	return (
		<Wrapper key={trackId} {...rest} style={styles} data-disabled={disabled} onPointerDown={handleClickTrack} onContextMenu={(ev) => ev.preventDefault()}>
			{backgroundBoxes.map((box) => (
				<EventGridBackgroundBox key={resolveEventId({ type: trackId, time: box.time })} sid={sid} bid={bid} box={box} />
			))}
			{events.map((event) => {
				return <EventGridEventItem key={resolveEventId(event)} sid={sid} bid={bid} event={event} trackWidth={width} onEventPointerDown={onEventPointerDown} onEventPointerOver={onEventPointerOver} onEventPointerOut={onEventPointerOut} onEventWheel={onEventWheel} />;
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
