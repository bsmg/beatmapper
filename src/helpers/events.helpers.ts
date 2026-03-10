import { renamer } from "bsmap/extensions";
import type { EnvironmentAllName, wrapper } from "bsmap/types";
import { check, number, pipe } from "valibot";

import { COMMON_EVENT_TRACKS, SUPPORTED_EVENT_TRACKS } from "$/constants";
import { App, type IEventTracks, TrackType } from "$/types";
import { createDataFactory } from "./factory.helpers";

export function isLightTrack(trackId: number, tracks: IEventTracks) {
	return tracks[trackId].type === TrackType.LIGHT;
}
export function isTriggerTrack(trackId: number, tracks: IEventTracks) {
	return tracks[trackId].type === TrackType.TRIGGER;
}
export function isValueTrack(trackId: number, tracks: IEventTracks) {
	return tracks[trackId].type === TrackType.VALUE;
}

export function isMirroredTrack(trackId: number, tracks: IEventTracks) {
	return !!tracks[trackId].side;
}
export function isSideTrack(trackId: number, side: "left" | "right", tracks: IEventTracks) {
	return tracks[trackId].side === side;
}
export function resolveMirroredTrack(trackId: number, tracks: IEventTracks) {
	if (!isMirroredTrack(trackId, tracks)) return trackId;

	const track = tracks[trackId];

	const mirroredTrack = Object.entries(tracks).find(([, t]) => {
		return t.type === track.type && t.side === (track.side === "left" ? "right" : "left");
	});

	return mirroredTrack ? Number.parseInt(mirroredTrack[0], 10) : trackId;
}

export function isBasicEvent(data: unknown): data is wrapper.IWrapBasicEvent {
	if (typeof data !== "object" || !data) return false;
	return "type" in data;
}
export function isBoostEvent(data: unknown): data is wrapper.IWrapColorBoostEvent {
	if (typeof data !== "object" || !data) return false;
	return "toggle" in data;
}
export function resolveTrackIdForEvent(data: unknown) {
	if (isBasicEvent(data)) return data.type;
	if (isBoostEvent(data)) return 5;
	throw new Error("Invalid event data.", { cause: data });
}

export function resolveEventId<T extends Pick<wrapper.IWrapBasicEvent, "time" | "type"> | Pick<wrapper.IWrapColorBoostEvent, "time" | "toggle">>(x: T) {
	return `${resolveTrackIdForEvent(x)}/${x.time}`;
}

export function isBasicLightEvent<T extends Pick<wrapper.IWrapBasicEvent, "type">>(data: T, tracks: IEventTracks) {
	return isBasicEvent(data) && isLightTrack(resolveTrackIdForEvent(data), tracks);
}
export function isBasicTriggerEvent<T extends Pick<wrapper.IWrapBasicEvent, "type">>(data: T, tracks: IEventTracks) {
	return isBasicEvent(data) && isTriggerTrack(resolveTrackIdForEvent(data), tracks);
}
export function isBasicValueEvent<T extends Pick<wrapper.IWrapBasicEvent, "type">>(data: T, tracks: IEventTracks) {
	return isBasicEvent(data) && isValueTrack(resolveTrackIdForEvent(data), tracks);
}

export function isLightEffectActive(effect: App.BasicEventEffect) {
	return effect === App.BasicEventEffect.ON || effect === App.BasicEventEffect.FLASH || effect === App.BasicEventEffect.TRANSITION;
}

export function resolveBasicEventColor<T extends Pick<wrapper.IWrapBasicEvent, "value">>(data: T) {
	if (data.value > 8) return App.EventColor.WHITE;
	if (data.value > 4) return App.EventColor.PRIMARY;
	if (data.value > 0) return App.EventColor.SECONDARY;
	return null;
}
export function resolveBasicEventEffect<T extends Pick<wrapper.IWrapBasicEvent, "type" | "value">>(data: T, tracks: IEventTracks) {
	const trackId = resolveTrackIdForEvent(data);

	switch (tracks[trackId].type) {
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

interface IBasicEventValue {
	effect: App.BasicEventEffect;
	color?: App.EventColor | null;
	speed?: number;
}
export const { serialize: serializeBasicEventValue, deserialize: deserializeBasicEventValue } = createDataFactory<IBasicEventValue, number, { tracks: IEventTracks }, { tracks: IEventTracks; trackId: number }, { tracks: IEventTracks; trackId: number }>({
	validator: {
		constructor: ({ tracks, trackId }) => {
			return pipe(
				number(),
				check((value) => {
					if (isLightTrack(trackId, tracks)) return value >= 0 && value <= 12;
					return true;
				}),
			);
		},
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
			const effect = resolveBasicEventEffect({ type: trackId, value }, tracks);

			switch (tracks[trackId].type) {
				case TrackType.LIGHT: {
					return { effect: effect, color: resolveBasicEventColor({ value }) };
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
});

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
		return false;
	});

	const processed = filtered.map(([id, track]) => {
		const trackId = Number.parseInt(id, 10);
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
