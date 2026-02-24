import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createBasicEvent, type EventType } from "bsmap";
import { type ComponentProps, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent, isValueEvent, resolveEventColor, resolveEventEffect, resolveEventId, resolveEventType, resolveEventValue, resolveTrackType } from "$/helpers/events.helpers";
import { addBasicEvent, bulkAddBasicEvent, bulkRemoveEvent, deselectEvent, mirrorBasicEvent, removeEvent, selectEvent, updateBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBasicEventsForTrackInWindow, selectColorScheme, selectEventEditorStartAndEndBeat, selectEventsEditorColor, selectEventsEditorMirrorLock, selectEventsEditorTool, selectEventTracksForEnvironment, selectInitialStateForTrack } from "$/store/selectors";
import { type Accept, App, type IEventTracks, TrackType } from "$/types";
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
}
function BasicEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const events = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, sid, trackId));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColorType = useAppSelector(selectEventsEditorColor);
	const initialTrackLightingState = useAppSelector((state) => selectInitialStateForTrack(state, sid, trackId));
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);

	const backgroundBoxes = useMemo(() => {
		const { color, brightness } = initialTrackLightingState;
		return createBackgroundBoxes(events, trackId, { initialColor: color ?? null, initialBrightness: brightness ?? null, startBeat, numOfBeatsToShow, tracks });
	}, [events, trackId, initialTrackLightingState, startBeat, numOfBeatsToShow, tracks]);

	const resolveEventData = useCallback(
		(time: number, norm: number) => {
			const type = resolveTrackType(trackId, tracks);

			switch (type) {
				case TrackType.LIGHT: {
					const value = resolveEventValue({ effect: selectedTool, color: selectedColorType }, { tracks });
					const floatValue = Math.round(normalize(1 - (norm ?? 0), 0, 1, 0, 2)) / 2;
					return createBasicEvent({ time, type: trackId, value: value, floatValue: floatValue });
				}
				case TrackType.TRIGGER: {
					const value = resolveEventValue({ effect: App.BasicEventEffect.TRIGGER }, { tracks });
					return createBasicEvent({ time, type: trackId, value: value });
				}
				case TrackType.VALUE: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 8, 0));
					return createBasicEvent({ time, type: trackId, value: value });
				}
				default: {
					throw new Error(`Unsupported track: ${trackId}`);
				}
			}
		},
		[tracks, selectedColorType, selectedTool, trackId],
	);

	const api = EventGrid.useContext();

	const actions = useMemo<EventGrid.IPlacementActions<App.IBasicEvent>>(() => {
		return {
			onCreate: resolveEventData,
			onPlace: (data, isBulk) => dispatch((isBulk ? bulkAddBasicEvent : addBasicEvent)({ data, tracks, areLasersLocked })),
			onSelect: (data) => dispatch(selectEvent({ query: data, tracks, areLasersLocked })),
			onDeselect: (data) => dispatch(deselectEvent({ query: data, tracks, areLasersLocked })),
			onPick: (data) => dispatch(mirrorBasicEvent({ query: data, tracks, areLasersLocked })),
			onDelete: (data, isBulk) => dispatch((isBulk ? bulkRemoveEvent : removeEvent)({ query: data, tracks, areLasersLocked })),
			onWheel: (data, delta) => {
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
						return data;
					}
				}
			},
		};
	}, [dispatch, resolveEventData, tracks, areLasersLocked]);

	const resolveEventStyle = useCallback(
		(data: App.IBasicEvent) => {
			const { style, value } = resolveBackgroundForEvent(data, { tracks, colorScheme });
			return { "--event-color": style, background: style, color: isColorDark(value) ? "white" : "black" };
		},
		[tracks, colorScheme],
	);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, actions)} {...rest}>
			<For each={backgroundBoxes}>{(box) => <EventGrid.BackgroundBox key={resolveEventId({ type: trackId, time: box.time })} {...api.getBackgroundBoxProps(box, colorScheme)} />}</For>
			<For each={events}>
				{(data) => (
					<EventGrid.Event key={resolveEventId(data)} data={data} {...api.getEventProps(data, actions, resolveEventStyle(data))}>
						{isLightEvent(data, tracks) && data.value !== 0 ? data.floatValue : undefined}
						{isValueEvent(data, tracks) && data.value}
					</EventGrid.Event>
				)}
			</For>
		</EventGrid.Track>
	);
}

export default BasicEventTrack;
