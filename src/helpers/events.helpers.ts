import type { container, v1 as v1t, v2 as v2t, v3 as v3t } from "bsmap/types";

import { EVENT_TRACKS } from "$/constants";
import { App, type Member, TrackType } from "$/types";
import { v1, v2, v3, v4 } from "bsmap";
import { object } from "valibot";
import type { LightshowEntitySerializationOptions } from "./object.helpers";
import { createPropertySerializationFactory, createSerializationFactory } from "./serialization.helpers";

export function resolveEventId<T extends Pick<App.BasicEvent, "beatNum" | "trackId">>(x: T) {
	return `${EVENT_TRACKS.map((x) => x.id).indexOf(x.trackId)}-${x.beatNum}`;
}

function convertTracksToArray(tracks = EVENT_TRACKS, filter = (track: Member<typeof EVENT_TRACKS>) => !!track.type) {
	const filtered = tracks.filter(filter);
	return filtered.reduce(
		(acc, { id }) => {
			const key = Object.values(App.TrackId).indexOf(id);
			acc[key] = id;
			return acc;
		},
		[] as (App.TrackId | null)[],
	);
}
function resolveTrackType(trackId: App.TrackId, tracks = EVENT_TRACKS) {
	const match = tracks.find((track) => track.id === trackId);
	if (!match) return TrackType.UNSUPPORTED;
	return match.type;
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

const { serialize: serializeEventValue, deserialize: deserializeEventValue } = createPropertySerializationFactory<{ effect: App.BasicEventType; color?: App.EventColor; value?: number }, number, LightshowEntitySerializationOptions, LightshowEntitySerializationOptions & { trackId: App.TrackId | "unknown" }>(() => {
	return {
		validate: (value, { tracks, trackId }) => {
			const type = trackId && trackId !== "unknown" ? resolveTrackType(trackId, tracks) : TrackType.UNSUPPORTED;
			if (type === TrackType.LIGHT) return value >= 0 && value <= 12;
			return true;
		},
		container: {
			serialize: (data) => {
				if (data.effect === App.BasicEventType.TRIGGER) return 0;
				if (data.effect === App.BasicEventType.VALUE && data.value) return data.value;
				if (!data.color || !data.effect || data.effect === App.BasicEventType.OFF) return 0;
				const c = Object.values([App.EventColor.SECONDARY, App.EventColor.PRIMARY, App.EventColor.WHITE]).indexOf(data.color);
				const e = Object.values<App.BasicEventType>([App.BasicEventType.ON, App.BasicEventType.FLASH, App.BasicEventType.FADE, App.BasicEventType.TRANSITION]).indexOf(data.effect);
				return 4 * c + (e + 1);
			},
			deserialize: (value, { tracks, trackId }) => {
				const type = trackId && trackId !== "unknown" ? resolveTrackType(trackId, tracks) : TrackType.UNSUPPORTED;
				switch (type) {
					case TrackType.LIGHT: {
						function resolveEventColor(value: number) {
							if (value > 8) return App.EventColor.WHITE;
							if (value > 4) return App.EventColor.PRIMARY;
							if (value > 0) return App.EventColor.SECONDARY;
							return undefined;
						}
						function resolveEventEffect(value: number) {
							if (value === 0) return App.BasicEventType.OFF;
							if (value % 4 === 1) return App.BasicEventType.ON;
							if (value % 4 === 2) return App.BasicEventType.FLASH;
							if (value % 4 === 3) return App.BasicEventType.FADE;
							if (value % 4 === 0) return App.BasicEventType.TRANSITION;
							return undefined;
						}
						return { effect: resolveEventEffect(value) ?? "rotate", color: resolveEventColor(value) };
					}
					case TrackType.VALUE: {
						return { effect: App.BasicEventType.VALUE, value };
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

type SharedOptions = [LightshowEntitySerializationOptions, {}, {}, {}, {}];

export const { serialize: serializeBasicEvent, deserialize: deserializeBasicEvent } = createSerializationFactory<App.BasicEvent, [v1t.IEvent, v2t.IEvent, v3t.IBasicEvent, container.v4.IBasicEventContainer], SharedOptions, SharedOptions>("BasicEvent", () => {
	return {
		1: {
			schema: v1.EventSchema,
			container: {
				serialize: (s, { tracks }) => {
					const allTracks = convertTracksToArray(tracks);
					const value = serializeEventValue({ effect: s.type, color: isLightEvent(s) ? s.colorType : undefined, value: isValueEvent(s) ? s.laserSpeed : undefined }, { tracks });
					return {
						_time: s.beatNum,
						_type: allTracks.indexOf(s.trackId),
						_value: value,
					};
				},
				deserialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks);
					const trackId = allTracks[s._type ?? 0];
					const fromValue = deserializeEventValue(s._value ?? 0, { tracks, trackId: trackId ?? "unknown" });
					if (!trackId) throw new Error(`Invalid track id: ${s._type}`);
					return {
						id: resolveEventId({ beatNum: s._time ?? 0, trackId }),
						beatNum: s._time ?? 0,
						trackId: trackId,
						type: isLightTrack(trackId, tracks) ? fromValue.effect : isValueTrack(trackId, tracks) ? "change-speed" : "rotate",
						colorType: isLightTrack(trackId, tracks) ? fromValue.color : undefined,
						laserSpeed: isValueTrack(trackId, tracks) ? (s._value ?? 0) : undefined,
					} as App.BasicEvent;
				},
			},
		},
		2: {
			schema: v2.EventSchema,
			container: {
				serialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks);
					const value = serializeEventValue({ effect: s.type, color: isLightEvent(s) ? s.colorType : undefined, value: isValueEvent(s) ? s.laserSpeed : undefined }, { tracks });
					return {
						_time: s.beatNum,
						_type: allTracks.indexOf(s.trackId),
						_value: value,
						_floatValue: isLightEvent(s) ? 1 : 0,
					};
				},
				deserialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks);
					const trackId = allTracks[s._type ?? 0];
					const fromValue = deserializeEventValue(s._value ?? 0, { tracks, trackId: trackId ?? "unknown" });
					if (!trackId) throw new Error(`Invalid track id: ${s._type}`);
					return {
						id: resolveEventId({ beatNum: s._time ?? 0, trackId }),
						beatNum: s._time ?? 0,
						trackId: trackId,
						type: isLightTrack(trackId, tracks) ? fromValue.effect : isValueTrack(trackId, tracks) ? "change-speed" : "rotate",
						colorType: isLightTrack(trackId, tracks) ? fromValue.color : undefined,
						laserSpeed: isValueTrack(trackId, tracks) ? (s._value ?? 0) : undefined,
					} as App.BasicEvent;
				},
			},
		},
		3: {
			schema: v3.BasicEventSchema,
			container: {
				serialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks ?? EVENT_TRACKS);
					const value = serializeEventValue({ effect: s.type, color: isLightEvent(s) ? s.colorType : undefined, value: isValueEvent(s) ? s.laserSpeed : undefined }, { tracks });
					return {
						b: s.beatNum,
						et: allTracks.indexOf(s.trackId),
						i: value,
						f: isLightEvent(s) ? 1 : 0,
					};
				},
				deserialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks);
					const trackId = allTracks[s.et ?? 0];
					const fromValue = deserializeEventValue(s.i ?? 0, { tracks, trackId: trackId ?? "unknown" });
					if (!trackId) throw new Error(`Invalid track id: ${s.et}`);
					return {
						id: resolveEventId({ beatNum: s.b ?? 0, trackId }),
						beatNum: s.b ?? 0,
						trackId: trackId,
						type: isLightTrack(trackId, tracks) ? fromValue.effect : isValueTrack(trackId, tracks) ? "change-speed" : "rotate",
						colorType: isLightTrack(trackId, tracks) ? fromValue.color : undefined,
						laserSpeed: isValueTrack(trackId, tracks) ? (s.i ?? 0) : undefined,
					} as App.BasicEvent;
				},
			},
		},
		4: {
			schema: object({ object: v4.ObjectSchema, data: v4.BasicEventSchema }),
			container: {
				serialize: (data, { tracks = EVENT_TRACKS }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks ?? EVENT_TRACKS);
					const value = serializeEventValue({ effect: data.type, color: isLightEvent(data) ? data.colorType : undefined, value: isValueEvent(data) ? data.laserSpeed : undefined }, { tracks });
					return {
						object: {
							b: data.beatNum,
						},
						data: {
							t: allTracks.indexOf(data.trackId),
							i: value,
							f: isLightEvent(data) ? 1 : 0,
						},
					};
				},
				deserialize: (s, { tracks }: LightshowEntitySerializationOptions) => {
					const allTracks = convertTracksToArray(tracks);
					const trackId = allTracks[s.data.t ?? 0];
					const fromValue = deserializeEventValue(s.data.i ?? 0, { tracks, trackId: trackId ?? "unknown" });
					if (!trackId) throw new Error(`Invalid track id: ${s.data.t}`);
					return {
						id: resolveEventId({ beatNum: s.object.b ?? 0, trackId }),
						beatNum: s.object.b ?? 0,
						trackId: trackId,
						type: isLightTrack(trackId, tracks) ? fromValue.effect : isValueTrack(trackId, tracks) ? "change-speed" : "rotate",
						colorType: isLightTrack(trackId, tracks) ? fromValue.color : undefined,
						laserSpeed: isValueTrack(trackId, tracks) ? (s.data.i ?? 0) : undefined,
					} as App.BasicEvent;
				},
			},
		},
	};
});
