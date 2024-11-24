import { nanoid } from "nanoid";

import { LIGHTING_TRACKS, LIGHT_EVENTS_ARRAY, LIGHT_EVENT_TYPES, TRACK_IDS_ARRAY, TRACK_ID_MAP } from "$/constants";
import { App, type Json } from "$/types";

export function isLightEvent(event: App.BasicEvent): event is App.IBasicLightEvent {
	return LIGHTING_TRACKS.includes(event.trackId);
}

// NOTE: This method mutates the `events` array supplied.
// This is done because it is called within an Immer `produce` call, which uses proxies to avoid actually doing mutation.
// But, if you call this from a foreign context, you won't get that, so be wary.
// This is the kind of thing I'm doing only because this isn't a shared codebase :D
export function nudgeEvents<T extends App.BasicEvent>(direction: "forwards" | "backwards", amount: number, events: T[]) {
	const sign = direction === "forwards" ? 1 : -1;

	for (const event of events) {
		if (!event.selected) {
			return;
		}

		event.beatNum += amount * sign;
	}
}

function convertLightingEventToJson<T extends App.IBasicLightEvent>(event: T): Json.Event {
	// `Off` events have no color attribute, since there is no way to tell when importing whether it was supposed to be red or blue.
	const value = event.colorType ? LIGHT_EVENT_TYPES[event.colorType][event.type] : 0;

	return {
		_time: event.beatNum,
		_type: TRACK_ID_MAP[event.trackId],
		_value: value,
	};
}

function convertLaserSpeedEventToJson<T extends App.IBasicValueEvent>(event: T): Json.Event {
	const type = TRACK_ID_MAP[event.trackId];

	return {
		_time: event.beatNum,
		_type: type,
		_value: event.laserSpeed,
	};
}
function convertRotationEventToJson<T extends App.IBasicTriggerEvent>(event: T): Json.Event {
	const type = TRACK_ID_MAP[event.trackId];

	return {
		_time: event.beatNum,
		_type: type,
		_value: 0,
	};
}

export function convertEventsToExportableJson<T extends App.BasicEvent>(events: T[]) {
	return events.map((event) => {
		if (event.trackId === App.TrackId[12] || event.trackId === App.TrackId[13]) {
			return convertLaserSpeedEventToJson(event as App.IBasicValueEvent);
		}
		if (event.trackId === App.TrackId[8] || event.trackId === App.TrackId[9]) {
			return convertRotationEventToJson(event as App.IBasicTriggerEvent);
		}
		return convertLightingEventToJson(event as App.IBasicLightEvent);
	});
}

export function convertEventsToRedux<T extends Json.Event>(events: T[]): App.BasicEvent[] {
	return events.map((event) => {
		const id = nanoid();
		const trackId = TRACK_IDS_ARRAY[event._type];
		const beatNum = event._time;

		// Lighting event
		if (event._type <= 4) {
			const lightingType = LIGHT_EVENTS_ARRAY[event._value];
			const colorType = event._value === 0 ? undefined : event._value < 4 ? App.EventColor.SECONDARY : App.EventColor.PRIMARY;

			return {
				id,
				trackId,
				beatNum,
				type: lightingType,
				colorType,
			} as App.IBasicLightEvent;
		}
		if (trackId === App.TrackId[8] || trackId === App.TrackId[9]) {
			return {
				id,
				trackId,
				beatNum,
				type: App.BasicEventType.TRIGGER,
			} as App.IBasicTriggerEvent;
		}
		if (trackId === App.TrackId[12] || trackId === App.TrackId[13]) {
			const laserSpeed = event._value;

			return {
				id,
				trackId,
				beatNum,
				type: App.BasicEventType.VALUE,
				laserSpeed,
			} as App.IBasicValueEvent;
		}
		throw new Error(`Unrecognized event track: ${JSON.stringify(event._type, null, 2)}`);
	});
}
