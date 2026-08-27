import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createBasicEvent, type IBasicTrack, type ITrackDefinitions, type IWrapBasicEvent } from "bsmap";
import { type ComponentProps, memo, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For } from "$/components/ui/atoms";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { deserializeBasicEventValue, isBasicLightEvent, isBasicValueEvent, resolveBasicEventColor, resolveBasicEventEffect, resolveEventId, serializeBasicEventValue } from "$/helpers/events.helpers";
import { addBasicEvent, deselectBasicEvent, removeBasicEvent, selectBasicEvent, updateBasicEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectAllBasicEventsForTrack,
	selectAllBoostEvents,
	selectColorBoostAtBeat,
	selectColorScheme,
	selectCurrentLightStateForTrack,
	selectEditorOffsetInBeats,
	selectEnvironment,
	selectEventsEditorColor,
	selectEventsEditorMirrorLock,
	selectEventsEditorStartAndEndBeat,
	selectEventsEditorTool,
	selectEventTracksForEnvironment,
} from "$/store/selectors";
import { type App, BasicEventEffect, EventColor } from "$/types";
import { clamp, cycle, isColorDark, normalize, roundToNearest } from "$/utils";
import { createBackgroundBoxes, resolveColorForLightState } from "./track.helpers";

function resolveBackgroundForEvent(data: IWrapBasicEvent, options: Parameters<typeof resolveColorForItem>[1] & { isBoosted: boolean; tracks: ITrackDefinitions<IBasicTrack> }) {
	const effect = resolveBasicEventEffect(data, options.tracks);

	const key = resolveColorForLightState({ color: resolveBasicEventColor(data), isBoosted: options.isBoosted }, options);
	const color = isBasicLightEvent(data, options.tracks) ? (key ?? resolveColorForItem(effect, options)) : resolveColorForItem(effect, options);

	const toWhite = `color-mix(in srgb, ${color}, white 30%)`;
	const toBlack = `color-mix(in srgb, ${color}, black 30%)`;

	switch (effect) {
		case BasicEventEffect.ON: {
			return { value: color, style: color };
		}
		case BasicEventEffect.FLASH: {
			return { value: color, style: `linear-gradient(90deg, ${toBlack}, ${toWhite})` };
		}
		case BasicEventEffect.FADE: {
			return { value: color, style: `linear-gradient(-90deg, ${toBlack}, ${toWhite})` };
		}
		case BasicEventEffect.TRANSITION: {
			return { value: color, style: `linear-gradient(0deg, ${toBlack}, ${toWhite})` };
		}
		default: {
			return { value: color, style: `linear-gradient(90deg, ${toBlack}, ${toWhite}, ${toBlack})` };
		}
	}
}

const BasicEvent = memo(function BasicEvent({ data, actions }: { data: App.IBasicEvent; actions: EventGrid.IPlacementActions<IWrapBasicEvent> }) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const api = EventGrid.useContext();

	const isEventBoosted = useAppSelector((state) => selectColorBoostAtBeat(state, { beforeBeat: data.time + 0.001 }));

	const resolveEventStyle = useCallback(
		(data: IWrapBasicEvent) => {
			const { style, value } = resolveBackgroundForEvent(data, { tracks, colorScheme, isBoosted: isEventBoosted });
			return { "--event-color": style, background: style, color: isColorDark(value) ? "white" : "black" };
		},
		[tracks, colorScheme, isEventBoosted],
	);

	return (
		<EventGrid.Event key={resolveEventId(data)} data={data} {...api.getEventProps(data, actions, resolveEventStyle(data))}>
			{isBasicLightEvent(data, tracks) && data.value !== 0 ? data.floatValue : undefined}
			{isBasicValueEvent(data, tracks) && data.value}
		</EventGrid.Event>
	);
});

interface Props {
	trackId: number;
}
function BasicEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColorType = useAppSelector(selectEventsEditorColor);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const { startBeat, endBeat } = useAppSelector((state) => selectEventsEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const environment = useAppSelector((state) => selectEnvironment(state, sid, bid));
	const basicEvents = useAppSelector((state) => selectAllBasicEventsForTrack(state, trackId));
	const boostEvents = useAppSelector((state) => selectAllBoostEvents(state));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const initialLightState = useAppSelector((state) => selectCurrentLightStateForTrack(state, sid, bid, trackId));
	const offsetInBeats = useAppSelector((state) => selectEditorOffsetInBeats(state, sid));

	const visibleEvents = useMemo(() => basicEvents.filter((x) => x.time >= startBeat && x.time < endBeat), [basicEvents, startBeat, endBeat]);

	const backgroundBoxes = useMemo(() => {
		return createBackgroundBoxes(trackId, { tracks, colorScheme, offsetInBeats, basicEvents, boostEvents, initialLightState, startBeat, endBeat });
	}, [initialLightState, trackId, tracks, colorScheme, offsetInBeats, basicEvents, boostEvents, startBeat, endBeat]);

	const api = EventGrid.useContext();

	const resolveEventData = useCallback(
		(time: number, norm: number) => {
			switch (tracks[trackId].type) {
				case 0: {
					const value = serializeBasicEventValue({ effect: selectedTool, color: selectedColorType }, { tracks });
					const floatValue = roundToNearest(normalize(norm ?? 0, 0, 1, 1, 0), 0.5);
					return createBasicEvent({ time, type: trackId, value: value, floatValue: floatValue });
				}
				case 1: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 1, 0));
					return createBasicEvent({ time, type: trackId, value: value });
				}
				case 3: {
					const floatValue = Math.round(normalize(norm ?? 0, 0, 1, 1, 0));
					return createBasicEvent({ time, type: trackId, floatValue: floatValue });
				}
				case 4: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 7, 0));
					return createBasicEvent({ time, type: trackId, value: value });
				}
				case 5: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 43, 0));
					return createBasicEvent({ time, type: trackId, value: value });
				}
				case 6: {
					const value = Math.round(normalize(norm ?? 0, 0, 1, 7, 1));
					return createBasicEvent({ time, type: trackId, value: value });
				}
				default: {
					const value = serializeBasicEventValue({ effect: BasicEventEffect.TRIGGER }, { tracks });
					return createBasicEvent({ time, type: trackId, value: value });
				}
			}
		},
		[tracks, selectedColorType, selectedTool, trackId],
	);

	const actions = useMemo<EventGrid.IPlacementActions<IWrapBasicEvent>>(() => {
		return {
			selectId: resolveEventId,
			onCreate: resolveEventData,
			onPlace: (data, _) => dispatch(addBasicEvent({ data: data, environment, areLasersLocked })),
			onDelete: (_, id) => dispatch(removeBasicEvent({ id, environment, areLasersLocked })),
			onSelect: (_, id) => dispatch(selectBasicEvent({ id, environment, areLasersLocked })),
			onDeselect: (_, id) => dispatch(deselectBasicEvent({ id, environment, areLasersLocked })),
			onPick: (data, id) => {
				const MIRRORABLE_COLORS = Object.values(EventColor).slice(0, -1);

				switch (tracks[trackId].type) {
					case 0: {
						const { effect, color } = deserializeBasicEventValue(data.value, { tracks, trackId });
						const newColor = color && MIRRORABLE_COLORS.includes(color) ? cycle(MIRRORABLE_COLORS, color) : color;
						const newValue = serializeBasicEventValue({ effect, color: newColor }, { tracks });
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { value: newValue } }));
					}
					default: {
						return data;
					}
				}
			},
			onWheel: (data, id, delta) => {
				const step = (x: number, step: number) => {
					return x + step / delta;
				};

				switch (tracks[trackId].type) {
					case 0: {
						const floatValue = clamp(step(data.floatValue, 0.125), 0, Number.POSITIVE_INFINITY);
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { floatValue } }));
					}
					case 1: {
						const value = clamp(step(data.value, 1), 0, 1);
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { value } }));
					}
					case 3: {
						const floatValue = clamp(step(data.floatValue, 1), 0, Number.POSITIVE_INFINITY);
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { floatValue } }));
					}
					case 4: {
						const value = clamp(step(data.value, 1), 0, Number.POSITIVE_INFINITY);
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { value } }));
					}
					case 5: {
						const value = clamp(step(data.value, 1), 0, 43); // ???
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { value } }));
					}
					case 6: {
						const value = clamp(step(data.value, 1), 1, 7);
						return dispatch(updateBasicEvent({ id, environment, areLasersLocked, changes: { value } }));
					}
					default: {
						return data;
					}
				}
			},
		};
	}, [dispatch, resolveEventData, trackId, tracks, environment, areLasersLocked]);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, environment, actions)} {...rest}>
			<For each={backgroundBoxes}>{(box) => <EventGrid.BackgroundBox key={resolveEventId({ type: trackId, time: box.time })} {...api.getBackgroundBoxProps(box)} />}</For>
			<For each={visibleEvents}>{(data) => <BasicEvent data={data} actions={actions} />}</For>
		</EventGrid.Track>
	);
}

export default memo(BasicEventTrack);
