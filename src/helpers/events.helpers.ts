import { renamer } from "bsmap/extensions";
import type { EnvironmentAllName, EventType } from "bsmap/types";

import { ALL_EVENT_TRACKS, COMMON_EVENT_TRACKS, SUPPORTED_EVENT_TRACKS } from "$/constants";
import { type Accept, App, type IEventTracks, TrackType } from "$/types";
import type { LightshowEntitySerializationOptions } from "./object.helpers";
import { createPropertySerializationFactory } from "./serialization.helpers";

export function resolveTrackType(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const match = Object.entries(tracks).find(([id]) => trackId === Number.parseInt(id));
	if (!match) return TrackType.UNSUPPORTED;
	return match[1].type;
}

export function resolveEventId<T extends Pick<App.IBasicEvent, "time" | "type">>(x: T) {
	return `${x.type}/${x.time}`;
}
export function resolveEventColor<T extends Pick<App.IBasicEvent, "value">>(data: T) {
	if (data.value > 8) return App.EventColor.WHITE;
	if (data.value > 4) return App.EventColor.PRIMARY;
	if (data.value > 0) return App.EventColor.SECONDARY;
	return undefined;
}
export function resolveEventEffect<T extends Pick<App.IBasicEvent, "type" | "value">>(data: T, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const type = resolveTrackType(data.type, tracks);
	switch (type) {
		case TrackType.LIGHT: {
			if (data.value === 0) return App.BasicEventEffect.OFF;
			if (data.value % 4 === 1) return App.BasicEventEffect.ON;
			if (data.value % 4 === 2) return App.BasicEventEffect.FLASH;
			if (data.value % 4 === 3) return App.BasicEventEffect.FADE;
			if (data.value % 4 === 0) return App.BasicEventEffect.TRANSITION;
			return App.BasicEventEffect.OFF;
		}
		case TrackType.VALUE: {
			return App.BasicEventEffect.VALUE;
		}
		case TrackType.TRIGGER: {
			return App.BasicEventEffect.TRIGGER;
		}
		default: {
			throw new Error("Invalid value.");
		}
	}
}
export function resolveEventType<T extends Pick<App.IBasicEvent, "type" | "value">>(data: T, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const type = resolveTrackType(data.type, tracks);
	return type;
}

export function isLightTrack(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const LIGHT_TRACKS = Object.entries(tracks)
		.filter(([, { type }]) => type === TrackType.LIGHT)
		.map<number>(([id]) => Number.parseInt(id));
	return LIGHT_TRACKS.includes(trackId);
}
export function isTriggerTrack(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const TRIGGER_TRACKS = Object.entries(tracks)
		.filter(([, { type }]) => type === TrackType.TRIGGER)
		.map<number>(([id]) => Number.parseInt(id));
	return TRIGGER_TRACKS.includes(trackId);
}
export function isValueTrack(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const VALUE_TRACKS = Object.entries(tracks)
		.filter(([, { type }]) => type === TrackType.VALUE)
		.map<number>(([id]) => Number.parseInt(id));
	return VALUE_TRACKS.includes(trackId);
}
export function isMirroredTrack(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const mirrorTracks = Object.entries(tracks)
		.filter(([, track]) => "side" in track && !!track.side)
		.map<number>(([id]) => Number.parseInt(id));
	return mirrorTracks.includes(trackId);
}
export function isSideTrack(trackId: Accept<EventType, number>, side: "left" | "right", tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const mirrorTracks = Object.entries(tracks)
		.filter(([, track]) => "side" in track && track.side === side)
		.map<number>(([id]) => Number.parseInt(id));
	return mirrorTracks.includes(trackId);
}
export function resolveMirroredTrack(trackId: Accept<EventType, number>, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	const leftTracks = Object.entries(tracks)
		.filter(([, track]) => "side" in track && track.side === "left")
		.map<number>(([id]) => Number.parseInt(id));
	const rightTracks = Object.entries(tracks)
		.filter(([, track]) => "side" in track && track.side === "right")
		.map<number>(([id]) => Number.parseInt(id));
	return leftTracks.includes(trackId) ? rightTracks[leftTracks.indexOf(trackId)] : leftTracks[rightTracks.indexOf(trackId)];
}

export function isLightEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	return isLightTrack(event.type, tracks);
}
export function isTriggerEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	return isTriggerTrack(event.type, tracks);
}
export function isValueEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTracks = ALL_EVENT_TRACKS) {
	return isValueTrack(event.type, tracks);
}

export const { serialize: resolveEventValue, deserialize: resolveEventDerivedProps } = createPropertySerializationFactory<{ effect: App.BasicEventEffect; color?: App.EventColor; speed?: number }, number, LightshowEntitySerializationOptions, LightshowEntitySerializationOptions & { trackId: Accept<EventType, number> }>(
	() => {
		return {
			validate: (value, { tracks, trackId }) => {
				const type = resolveTrackType(trackId, tracks);
				if (type === TrackType.LIGHT) return value >= 0 && value <= 12;
				return true;
			},
			container: {
				serialize: (data) => {
					if (data.effect === App.BasicEventEffect.TRIGGER) return 0;
					if (data.effect === App.BasicEventEffect.VALUE && data.speed) return data.speed;
					if (!data.color || !data.effect || data.effect === App.BasicEventEffect.OFF) return 0;
					const c = Object.values([App.EventColor.SECONDARY, App.EventColor.PRIMARY, App.EventColor.WHITE]).indexOf(data.color);
					const e = Object.values<App.BasicEventEffect>([App.BasicEventEffect.ON, App.BasicEventEffect.FLASH, App.BasicEventEffect.FADE, App.BasicEventEffect.TRANSITION]).indexOf(data.effect);
					return 4 * c + (e + 1);
				},
				deserialize: (value, { tracks, trackId }) => {
					const type = resolveTrackType(trackId, tracks);
					const effect = resolveEventEffect({ type: trackId, value });
					switch (type) {
						case TrackType.LIGHT: {
							return { effect: effect, color: resolveEventColor({ value }) };
						}
						case TrackType.VALUE: {
							return { effect: App.BasicEventEffect.VALUE, speed: value };
						}
						case TrackType.TRIGGER: {
							return { effect: App.BasicEventEffect.TRIGGER };
						}
						default: {
							throw new Error("Invalid value.");
						}
					}
				},
			},
		};
	},
);

export function deriveEventTracksForEnvironment(environment: EnvironmentAllName) {
	const commonEventTracks = Object.keys(COMMON_EVENT_TRACKS);

	const environmentTypeMap = renamer.environmentTypeMap[environment];
	const environmentTrackIds = environmentTypeMap ? Object.keys(environmentTypeMap) : [];

	const legacyEnvironmentNames = Object.keys(renamer.environmentTypeMap).filter((_, i) => i <= 22);

	const filtered = Object.entries(SUPPORTED_EVENT_TRACKS).filter(([id]) => {
		if (environmentTypeMap && legacyEnvironmentNames.includes(environment)) {
			return environmentTrackIds.includes(id) || commonEventTracks.includes(id);
		}
		if (environmentTypeMap) {
			return environmentTrackIds.includes(id);
		}
		if (commonEventTracks.includes(id)) return true;
	});

	const processed = filtered.map(([id, track]) => {
		const trackId = Number.parseInt(id);
		const label = renamer.eventTypeRename(trackId, environment);
		let type = track.type;
		switch (environment) {
			case "InterscopeEnvironment": {
				if (trackId === 8) type = TrackType.VALUE;
				break;
			}
			case "BillieEnvironment": {
				if (trackId === 8) type = TrackType.VALUE;
				break;
			}
			case "LizzoEnvironment": {
				if (trackId === 8) type = TrackType.LIGHT;
				if (trackId === 9) type = TrackType.LIGHT;
				if (trackId === 12) type = TrackType.LIGHT;
				if (trackId === 16) type = TrackType.TRIGGER;
				if (trackId === 17) type = TrackType.TRIGGER;
				break;
			}
			case "TheSecondEnvironment": {
				if (trackId === 9) type = TrackType.VALUE;
				break;
			}
			case "BritneyEnvironment": {
				if (trackId === 8) type = TrackType.LIGHT;
				if (trackId === 9) type = TrackType.LIGHT;
				break;
			}
			case "Monstercat2Environment": {
				if (trackId === 8) type = TrackType.LIGHT;
				break;
			}
			case "MetallicaEnvironment": {
				if (trackId === 8) type = TrackType.LIGHT;
				break;
			}
		}
		return [id, { ...track, type, label: label }] as const;
	});

	return processed.reduce((acc: IEventTracks, [id, track]) => {
		acc[id] = track;
		return acc;
	}, {});
}
