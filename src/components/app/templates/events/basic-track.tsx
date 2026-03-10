import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createBasicEvent } from "bsmap";
import type { wrapper } from "bsmap/types";
import { type ComponentProps, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isBasicLightEvent, isBasicValueEvent, resolveBasicEventColor, resolveBasicEventEffect, resolveEventId, serializeBasicEventValue } from "$/helpers/events.helpers";
import { addBasicEvent, bulkAddBasicEvent, bulkRemoveEvent, deselectEvent, mirrorBasicEvent, removeEvent, selectEvent, updateBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrackInWindow,
	selectAllBoostEventsInWindow,
	selectColorScheme,
	selectCurrentLightStateForTrack,
	selectEditorOffsetInBeats,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorColor,
	selectEventsEditorMirrorLock,
	selectEventsEditorTool,
	selectEventTracksForEnvironment,
	selectToggleAtBeat,
} from "$/store/selectors";
import { App, type IEventTracks, TrackType } from "$/types";
import { clamp, isColorDark, normalize } from "$/utils";
import { createBackgroundBoxes, resolveColorForLightState } from "./track.helpers";

function resolveBackgroundForEvent(data: wrapper.IWrapBasicEvent, options: Parameters<typeof resolveColorForItem>[1] & { isBoosted: boolean; tracks: IEventTracks }) {
	const eventEffect = resolveBasicEventEffect(data, options.tracks);

	const key = resolveColorForLightState({ color: resolveBasicEventColor(data), isBoosted: options.isBoosted }, options);
	const color = isBasicLightEvent(data, options.tracks) ? (key ?? resolveColorForItem(eventEffect, options)) : resolveColorForItem(eventEffect, options);

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
	trackId: number;
}
function BasicEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const basicEvents = useAppSelector((state) => selectAllBasicEventsForTrackInWindow(state, sid, trackId));
	const boostEvents = useAppSelector((state) => selectAllBoostEventsInWindow(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColorType = useAppSelector(selectEventsEditorColor);
	const initialLightState = useAppSelector((state) => selectCurrentLightStateForTrack(state, sid, bid, trackId));
	const offsetInBeats = useAppSelector((state) => selectEditorOffsetInBeats(state, sid));
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);

	const backgroundBoxes = useMemo(() => {
		return createBackgroundBoxes(trackId, { tracks, colorScheme, offsetInBeats, basicEvents, boostEvents, initialLightState, startBeat, endBeat });
	}, [initialLightState, trackId, tracks, colorScheme, offsetInBeats, basicEvents, boostEvents, startBeat, endBeat]);

	const resolveEventData = useCallback(
		(time: number, norm: number) => {
			switch (tracks[trackId].type) {
				case TrackType.LIGHT: {
					const value = serializeBasicEventValue({ effect: selectedTool, color: selectedColorType }, { tracks });
					const floatValue = Math.round(normalize(1 - (norm ?? 0), 0, 1, 0, 2)) / 2;
					return createBasicEvent({ time, type: trackId, value: value, floatValue: floatValue });
				}
				case TrackType.TRIGGER: {
					const value = serializeBasicEventValue({ effect: App.BasicEventEffect.TRIGGER }, { tracks });
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

	const actions = useMemo<EventGrid.IPlacementActions<wrapper.IWrapBasicEvent>>(() => {
		return {
			onCreate: resolveEventData,
			onPlace: (data, isBulk) => dispatch((isBulk ? bulkAddBasicEvent : addBasicEvent)({ query: data, data: data, tracks, areLasersLocked })),
			onSelect: (data) => dispatch(selectEvent({ query: data, tracks, areLasersLocked })),
			onDeselect: (data) => dispatch(deselectEvent({ query: data, tracks, areLasersLocked })),
			onPick: (data) => dispatch(mirrorBasicEvent({ query: data, tracks, areLasersLocked })),
			onDelete: (data, isBulk) => dispatch((isBulk ? bulkRemoveEvent : removeEvent)({ query: data, tracks, areLasersLocked })),
			onWheel: (data, delta) => {
				switch (tracks[trackId].type) {
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
	}, [dispatch, resolveEventData, trackId, tracks, areLasersLocked]);

	const isEventBoosted = useAppSelector((state) => {
		return (data: wrapper.IWrapBasicEvent) => {
			return selectToggleAtBeat(state, { trackId: 5, beforeBeat: data.time + 0.001 });
		};
	});

	const resolveEventStyle = useCallback(
		(data: wrapper.IWrapBasicEvent) => {
			const { style, value } = resolveBackgroundForEvent(data, { tracks, colorScheme, isBoosted: isEventBoosted(data) });
			return { "--event-color": style, background: style, color: isColorDark(value) ? "white" : "black" };
		},
		[tracks, colorScheme, isEventBoosted],
	);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, actions)} {...rest}>
			<For each={backgroundBoxes}>{(box) => <EventGrid.BackgroundBox key={resolveEventId({ type: trackId, time: box.time })} {...api.getBackgroundBoxProps(box)} />}</For>
			<For each={basicEvents.filter((x) => x.time >= startBeat && x.time < endBeat)}>
				{(data) => (
					<EventGrid.Event key={resolveEventId(data)} data={data} {...api.getEventProps(data, actions, resolveEventStyle(data))}>
						{isBasicLightEvent(data, tracks) && data.value !== 0 ? data.floatValue : undefined}
						{isBasicValueEvent(data, tracks) && data.value}
					</EventGrid.Event>
				)}
			</For>
		</EventGrid.Track>
	);
}

export default BasicEventTrack;
