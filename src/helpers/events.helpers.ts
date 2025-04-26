import type { v2 } from "bsmap/types";

import { EVENT_TRACKS } from "$/constants";
import { App, TrackType } from "$/types";

export function resolveEventId<T extends Pick<App.BasicEvent, "beatNum" | "trackId">>(x: T) {
	return `${EVENT_TRACKS.map((x) => x.id).indexOf(x.trackId)}-${x.beatNum}`;
}

export function isLightTrack(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const LIGHT_TRACKS = tracks.filter(({ type }) => type === TrackType.LIGHT).map(({ id }) => id);
	return LIGHT_TRACKS.includes(trackId);
}
export function isTriggerTrack(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const TRIGGER_TRACKS = tracks.filter(({ type }) => type === TrackType.TRIGGER).map(({ id }) => id);
	return TRIGGER_TRACKS.includes(trackId);
}
export function isValueTrack(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const VALUE_TRACKS = tracks.filter(({ type }) => type === TrackType.VALUE).map(({ id }) => id);
	return VALUE_TRACKS.includes(trackId);
}

export function isMirroredTrack(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const mirrorTracks = tracks.filter((track) => !!track.side).map((x) => x.id);
	return mirrorTracks.includes(trackId);
}
export function getMirroredTrack(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const leftTracks = tracks.filter((track) => track.side === "left").map((x) => x.id);
	const rightTracks = tracks.filter((track) => track.side === "right").map((x) => x.id);
	return leftTracks.includes(trackId) ? rightTracks[leftTracks.indexOf(trackId)] : leftTracks[rightTracks.indexOf(trackId)];
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

const LIGHT_EVENT_TYPES = [App.BasicEventType.TRANSITION, App.BasicEventType.ON, App.BasicEventType.FLASH, App.BasicEventType.FADE] as const;

function serializeEventType<T extends App.BasicEvent>(event: T) {
	const TRACK_ID_MAP = Object.entries(App.TrackId).reduce(
		(acc: Record<App.TrackId, number>, [index, value]) => {
			acc[`${value}`] = Number(index);
			return acc;
		},
		{} as Record<App.TrackId, number>,
	);
	return TRACK_ID_MAP[event.trackId];
}
function serializeEventValue<T extends App.BasicEvent>(event: T) {
	if (isValueEvent(event)) return event.laserSpeed;
	if (isLightEvent(event)) {
		// `Off` events have no color attribute, since there is no way to tell when importing whether it was supposed to be red or blue.
		if (event.type === App.BasicEventType.OFF || !event.colorType) return 0;
		const value = 4 * Object.values(App.EventColor).indexOf(event.colorType) + LIGHT_EVENT_TYPES.indexOf(event.type) + 1;
		return value - 1;
	}
	return 0;
}

function convertLightingEventToJson<T extends App.IBasicLightEvent>(event: T): v2.IEvent {
	return {
		_time: event.beatNum,
		_type: serializeEventType(event),
		_value: serializeEventValue(event),
	};
}
function convertLaserSpeedEventToJson<T extends App.IBasicValueEvent>(event: T): v2.IEvent {
	return {
		_time: event.beatNum,
		_type: serializeEventType(event),
		_value: event.laserSpeed,
	};
}
function convertRotationEventToJson<T extends App.IBasicTriggerEvent>(event: T): v2.IEvent {
	return {
		_time: event.beatNum,
		_type: serializeEventType(event),
		_value: 0,
	};
}

export function convertEventsToExportableJson<T extends App.BasicEvent>(events: T[], tracks = EVENT_TRACKS) {
	return events.map((event) => {
		if (isLightTrack(event.trackId, tracks)) {
			return convertLightingEventToJson(event as App.IBasicLightEvent);
		}
		if (isTriggerTrack(event.trackId, tracks)) {
			return convertRotationEventToJson(event as App.IBasicTriggerEvent);
		}
		if (isValueTrack(event.trackId, tracks)) {
			return convertLaserSpeedEventToJson(event as App.IBasicValueEvent);
		}
		return {
			_time: event.beatNum,
			_type: serializeEventType(event),
			_value: 0,
		};
	});
}

export function convertEventsToRedux<T extends v2.IEvent>(events: T[], tracks = EVENT_TRACKS): App.BasicEvent[] {
	const TRACK_IDS_ARRAY = Object.entries(App.TrackId).reduce(
		(acc, [index, value]) => {
			acc[Number(index)] = value;
			return acc;
		},
		[] as (App.TrackId | null)[],
	);
	return events.map((event) => {
		const trackId = TRACK_IDS_ARRAY[event._type ?? 0] as App.TrackId;
		const beatNum = event._time ?? 0;
		const id = resolveEventId({ beatNum, trackId: trackId });
		if (isTriggerTrack(trackId, tracks)) {
			return { id, trackId, beatNum, type: App.BasicEventType.TRIGGER } as App.IBasicTriggerEvent;
		}
		if (isValueTrack(trackId, tracks)) {
			const laserSpeed = event._value;
			return { id, trackId, beatNum, type: App.BasicEventType.VALUE, laserSpeed } as App.IBasicValueEvent;
		}
		if (isLightTrack(trackId, tracks)) {
			const lightingType = event._value === 0 ? App.BasicEventType.OFF : LIGHT_EVENT_TYPES[(event._value ?? 0) % 4];
			const colorType = event._value === 0 ? undefined : Object.values(App.EventColor)[Math.floor(((event._value ?? 0) - 1) / 4)];
			return { id, trackId, beatNum, type: lightingType, colorType } as App.IBasicLightEvent;
		}
		throw new Error(`Unrecognized event track: ${JSON.stringify(event._type, null, 2)}`);
	});
}
