import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createBasicEvent, type EventType } from "bsmap";
import { type ComponentProps, type PointerEvent, useCallback, useEffect, useMemo, useState } from "react";

import { EventGrid } from "$/components/app/layouts";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { For } from "$/components/ui/atoms";
import { isLightEvent, isValueEvent, resolveEventId, resolveEventValue, resolveTrackType } from "$/helpers/events.helpers";
import { bulkAddBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrackInWindow,
	selectDurationInBeats,
	selectEditorOffsetInBeats,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorColor,
	selectEventsEditorCursor,
	selectEventsEditorEditMode,
	selectEventsEditorMirrorLock,
	selectEventsEditorTool,
	selectEventTracksForEnvironment,
	selectInitialStateForTrack,
} from "$/store/selectors";
import { type Accept, App, EventEditMode, TrackType } from "$/types";
import { clamp, normalize } from "$/utils";
import { createBackgroundBoxes } from "./track.helpers";

interface Props {
	trackId: Accept<EventType, number>;
	width: number;
	disabled: boolean;
	onEventPointerDown?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOut?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOver?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventWheel?: (event: WheelEvent, data: App.IBasicEvent) => void;
}
function BasicEventTrack({ trackId, width, disabled, onEventPointerDown, onEventPointerOver, onEventPointerOut, onEventWheel, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const dispatch = useAppDispatch();
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const cursorAtBeat = useAppSelector(selectEventsEditorCursor);
	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const offsetInBeats = useAppSelector((state) => -selectEditorOffsetInBeats(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, sid, trackId));
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColorType = useAppSelector(selectEventsEditorColor);
	const initialTrackLightingState = useAppSelector((state) => selectInitialStateForTrack(state, sid, trackId));
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);

	const [mouseButtonDepressed, setMouseButtonDepressed] = useState<"left" | "right" | null>(null);
	const [norm, setNorm] = useState<number | null>(null);

	const backgroundBoxes = useMemo(() => {
		const { color, brightness } = initialTrackLightingState;
		return createBackgroundBoxes(events, trackId, { initialColor: color ?? null, initialBrightness: brightness ?? null, startBeat, numOfBeatsToShow, tracks });
	}, [events, trackId, initialTrackLightingState, startBeat, numOfBeatsToShow, tracks]);

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
		<EventGrid.Track {...rest} disabled={disabled} onPointerDown={handleClickTrack} onContextMenu={(ev) => ev.preventDefault()}>
			<For each={backgroundBoxes}>{(box) => <EventGrid.BackgroundBox key={resolveEventId({ type: trackId, time: box.time })} box={box} />}</For>
			<For each={events}>
				{(event) => (
					<EventGrid.Event key={resolveEventId(event)} event={event} trackWidth={width} onEventPointerDown={onEventPointerDown} onEventPointerOver={onEventPointerOver} onEventPointerOut={onEventPointerOut} onEventWheel={onEventWheel}>
						{isLightEvent(event, tracks) && event.value !== 0 ? event.floatValue : undefined}
						{isValueEvent(event, tracks) && event.value}
					</EventGrid.Event>
				)}
			</For>
		</EventGrid.Track>
	);
}

export default BasicEventTrack;
