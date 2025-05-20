import { renamer } from "bsmap/extensions";
import type { EnvironmentAllName } from "bsmap/types";

import { ALL_EVENT_TRACKS, COMMON_EVENT_TRACKS, SUPPORTED_EVENT_TRACKS } from "$/constants";
import { App, type IEventTrack, TrackType } from "$/types";
import type { LightshowEntitySerializationOptions } from "./object.helpers";
import { createPropertySerializationFactory } from "./serialization.helpers";

export function resolveTrackType(type: number, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const match = tracks.find((track) => track.id === type);
	if (!match) return TrackType.UNSUPPORTED;
	return match.type;
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
export function resolveEventEffect<T extends Pick<App.IBasicEvent, "type" | "value">>(data: T, tracks = ALL_EVENT_TRACKS) {
	const type = resolveTrackType(data.type, tracks);
	switch (type) {
		case TrackType.LIGHT: {
			if (data.value === 0) return App.BasicEventType.OFF;
			if (data.value % 4 === 1) return App.BasicEventType.ON;
			if (data.value % 4 === 2) return App.BasicEventType.FLASH;
			if (data.value % 4 === 3) return App.BasicEventType.FADE;
			if (data.value % 4 === 0) return App.BasicEventType.TRANSITION;
			return App.BasicEventType.OFF;
		}
		case TrackType.VALUE: {
			return App.BasicEventType.VALUE;
		}
		case TrackType.TRIGGER: {
			return App.BasicEventType.TRIGGER;
		}
		default: {
			throw new Error("Invalid value.");
		}
	}
}
export function resolveEventType<T extends Pick<App.IBasicEvent, "type" | "value">>(data: T, tracks = ALL_EVENT_TRACKS) {
	const type = resolveTrackType(data.type, tracks);
	return type;
}

export function isLightTrack(trackId: App.TrackId, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const LIGHT_TRACKS = tracks.filter(({ type }) => type === TrackType.LIGHT).map<number>(({ id }) => id);
	return LIGHT_TRACKS.includes(trackId);
}
export function isTriggerTrack(trackId: App.TrackId, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const TRIGGER_TRACKS = tracks.filter(({ type }) => type === TrackType.TRIGGER).map<number>(({ id }) => id);
	return TRIGGER_TRACKS.includes(trackId);
}
export function isValueTrack(trackId: App.TrackId, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const VALUE_TRACKS = tracks.filter(({ type }) => type === TrackType.VALUE).map<number>(({ id }) => id);
	return VALUE_TRACKS.includes(trackId);
}
export function isMirroredTrack(trackId: App.TrackId, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const mirrorTracks = tracks.filter((track) => "side" in track && !!track.side).map<number>((x) => x.id);
	return mirrorTracks.includes(trackId);
}
export function isSideTrack(trackId: App.TrackId, side: "left" | "right", tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const mirrorTracks = tracks.filter((track) => "side" in track && track.side === side).map<number>((x) => x.id);
	return mirrorTracks.includes(trackId);
}
export function resolveMirroredTrack(trackId: App.TrackId, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	const leftTracks = tracks.filter((track) => "side" in track && track.side === "left").map<number>((x) => x.id);
	const rightTracks = tracks.filter((track) => "side" in track && track.side === "right").map<number>((x) => x.id);
	return leftTracks.includes(trackId) ? rightTracks[leftTracks.indexOf(trackId)] : leftTracks[rightTracks.indexOf(trackId)];
}

export function isLightEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	return isLightTrack(event.type, tracks);
}
export function isTriggerEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	return isTriggerTrack(event.type, tracks);
}
export function isValueEvent<T extends Pick<App.IBasicEvent, "type">>(event: T, tracks: IEventTrack[] = ALL_EVENT_TRACKS) {
	return isValueTrack(event.type, tracks);
}

export const { serialize: resolveEventValue, deserialize: resolveEventDerivedProps } = createPropertySerializationFactory<{ effect: App.BasicEventType; color?: App.EventColor; speed?: number }, number, LightshowEntitySerializationOptions, LightshowEntitySerializationOptions & { trackId: App.TrackId }>(() => {
	return {
		validate: (value, { tracks, trackId }) => {
			const type = resolveTrackType(trackId, tracks);
			if (type === TrackType.LIGHT) return value >= 0 && value <= 12;
			return true;
		},
		container: {
			serialize: (data) => {
				if (data.effect === App.BasicEventType.TRIGGER) return 0;
				if (data.effect === App.BasicEventType.VALUE && data.speed) return data.speed;
				if (!data.color || !data.effect || data.effect === App.BasicEventType.OFF) return 0;
				const c = Object.values([App.EventColor.SECONDARY, App.EventColor.PRIMARY, App.EventColor.WHITE]).indexOf(data.color);
				const e = Object.values<App.BasicEventType>([App.BasicEventType.ON, App.BasicEventType.FLASH, App.BasicEventType.FADE, App.BasicEventType.TRANSITION]).indexOf(data.effect);
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
						return { effect: App.BasicEventType.VALUE, speed: value };
					}
					case TrackType.TRIGGER: {
						return { effect: App.BasicEventType.TRIGGER };
					}
					default: {
						throw new Error("Invalid value.");
					}
				}
			},
		},
	};
});

export function deriveEventTracksForEnvironment(environment: EnvironmentAllName) {
	const commonEventTracks = COMMON_EVENT_TRACKS.map((x) => x.id);

	const environmentTypeMap = renamer.environmentTypeMap[environment];
	const environmentTrackIds = environmentTypeMap ? Object.keys(environmentTypeMap) : [];

	const filtered = SUPPORTED_EVENT_TRACKS.filter((x) => {
		if (environmentTypeMap) {
			return environmentTrackIds.includes(`${x.id}`) || commonEventTracks.includes(x.id);
		}
		if (commonEventTracks.includes(x.id)) return true;
	});

	const processed = filtered.map((x) => {
		const label = renamer.eventTypeRename(x.id, environment);
		let type = x.type;
		if (environment === "InterscopeEnvironment" && x.id === 8) type = TrackType.VALUE;
		if (environment === "BillieEnvironment" && x.id === 8) type = TrackType.VALUE;
		return { ...x, type, label: label };
	});

	return processed;
}
