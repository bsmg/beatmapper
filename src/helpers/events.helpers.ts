import { EVENT_TRACKS, LIGHT_EVENTS_ARRAY, LIGHT_EVENT_TYPES, TRACK_IDS_ARRAY, TRACK_ID_MAP } from "$/constants";
import { App, type Json, TrackType } from "$/types";

export function resolveEventId<T extends Pick<App.BasicEvent, "beatNum" | "trackId">>(x: T) {
	return `${EVENT_TRACKS.map((x) => x.id).indexOf(x.trackId)}-${x.beatNum}`;
}

export function isLightTrack(trackId: App.TrackId, tracks = EVENT_TRACKS): trackId is App.LightTrackId {
	const LIGHT_TRACKS = tracks.filter(({ type }) => type === TrackType.LIGHT).map(({ id }) => id);
	return LIGHT_TRACKS.includes(trackId);
}
export function isTriggerTrack(trackId: App.TrackId, tracks = EVENT_TRACKS): trackId is App.TriggerTrackId {
	const TRIGGER_TRACKS = tracks.filter(({ type }) => type === TrackType.TRIGGER).map(({ id }) => id);
	return TRIGGER_TRACKS.includes(trackId);
}
export function isValueTrack(trackId: App.TrackId, tracks = EVENT_TRACKS): trackId is App.ValueTrackId {
	const VALUE_TRACKS = tracks.filter(({ type }) => type === TrackType.VALUE).map(({ id }) => id);
	return VALUE_TRACKS.includes(trackId);
}

const LEFT_TRACKS: App.TrackId[] = [App.TrackId[2], App.TrackId[12]] as const;
const RIGHT_TRACKS: App.TrackId[] = [App.TrackId[3], App.TrackId[13]] as const;

export function isMirroredTrack(trackId: App.TrackId) {
	return [...LEFT_TRACKS, ...RIGHT_TRACKS].includes(trackId);
}
export function getMirroredTrack(trackId: App.TrackId) {
	if (!isMirroredTrack(trackId)) throw new Error("Not a mirrored track.");
	return LEFT_TRACKS.includes(trackId) ? RIGHT_TRACKS[LEFT_TRACKS.indexOf(trackId)] : LEFT_TRACKS[RIGHT_TRACKS.indexOf(trackId)];
}

export function isLightEvent(event: App.BasicEvent, tracks = EVENT_TRACKS): event is App.IBasicLightEvent {
	return isLightTrack(event.trackId, tracks);
}
export function isTriggerEvent(event: App.BasicEvent, tracks = EVENT_TRACKS): event is App.IBasicTriggerEvent {
	return isTriggerTrack(event.trackId, tracks);
}
export function isValueEvent(event: App.BasicEvent, tracks = EVENT_TRACKS): event is App.IBasicValueEvent {
	return isValueTrack(event.trackId, tracks);
}

export function isEventOn<T extends App.BasicEvent>(event: T) {
	const ON_EVENT_TYPES: App.BasicEventType[] = [App.BasicEventType.ON, App.BasicEventType.FLASH];
	return ON_EVENT_TYPES.includes(event.type);
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
		const trackId = TRACK_IDS_ARRAY[event._type] as App.TrackId;
		const beatNum = event._time;
		const id = resolveEventId({ beatNum, trackId: trackId });

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
