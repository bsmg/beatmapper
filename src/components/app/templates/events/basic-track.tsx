import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createBasicEvent, type EventType } from "bsmap";
import { type ComponentProps, type PointerEvent, useCallback, useEffect, useMemo, useState } from "react";

import { EventGrid } from "$/components/app/layouts";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { For } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent, isValueEvent, resolveEventColor, resolveEventEffect, resolveEventId, resolveEventValue, resolveTrackType } from "$/helpers/events.helpers";
import { bulkAddBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrackInWindow,
	selectColorScheme,
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
import { type Accept, App, EventEditMode, type IEventTracks, TrackType } from "$/types";
import { clamp, isColorDark, normalize } from "$/utils";
import { createBackgroundBoxes } from "./track.helpers";

function resolveBackgroundForEvent(event: App.IBasicEvent, options: Parameters<typeof resolveColorForItem>[1] & { tracks?: IEventTracks }) {
	const eventColor = resolveEventColor(event);
	const eventEffect = resolveEventEffect(event, options.tracks);

	const color = resolveColorForItem(isLightEvent(event, options.tracks) ? (eventColor ?? eventEffect) : eventEffect, options);

	const brightColor = `color-mix(in srgb, ${color}, white 30%)`;
	const semiTransparentColor = `color-mix(in srgb, ${color}, black 30%)`;

	switch (eventEffect) {
		case App.BasicEventEffect.ON: {
			return { value: color, style: color };
		}
		case App.BasicEventEffect.FLASH: {
			return { value: color, style: `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor})` };
		}
		case App.BasicEventEffect.FADE: {
			return { value: color, style: `linear-gradient(-90deg, ${semiTransparentColor}, ${brightColor})` };
		}
		case App.BasicEventEffect.TRANSITION: {
			return { value: color, style: `linear-gradient(0deg, ${semiTransparentColor}, ${brightColor})` };
		}
		default: {
			return { value: color, style: `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor}, ${semiTransparentColor})` };
		}
	}
}

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
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const duration = useAppSelector((state) => selectDurationInBeats(state, sid));
	const cursorAtBeat = useAppSelector(selectEventsEditorCursor);
	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const offsetInBeats = useAppSelector((state) => -selectEditorOffsetInBeats(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, sid, trackId));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
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

	const resolveEventStyle = useCallback(
		(data: App.IBasicEvent) => {
			const background = resolveBackgroundForEvent(data, { tracks, colorScheme });
			return { background: background.style, color: isColorDark(background.value) ? "white" : "black" };
		},
		[tracks, colorScheme],
	);

	return (
		<EventGrid.Track {...rest} disabled={disabled} onPointerDown={handleClickTrack} onContextMenu={(ev) => ev.preventDefault()}>
			<For each={backgroundBoxes}>{(box) => <EventGrid.BackgroundBox key={resolveEventId({ type: trackId, time: box.time })} box={box} />}</For>
			<For each={events}>
				{(event) => (
					<EventGrid.Event key={resolveEventId(event)} event={event} trackWidth={width} onEventPointerDown={onEventPointerDown} onEventPointerOver={onEventPointerOver} onEventPointerOut={onEventPointerOut} onEventWheel={onEventWheel} style={resolveEventStyle(event)}>
						{isLightEvent(event, tracks) && event.value !== 0 ? event.floatValue : undefined}
						{isValueEvent(event, tracks) && event.value}
					</EventGrid.Event>
				)}
			</For>
		</EventGrid.Track>
	);
}

export default BasicEventTrack;
