import { type EnvironmentName, type IBasicTrack, type ITrackDefinitions, type IWrapBasicEvent, type IWrapColorBoostEvent, isBasicBtsTrack, isBasicCarTrack, isBasicFloatValueTrack, isBasicIntValueTrack, isBasicLightTrack, isBasicNoneTrack, isBasicToggleTrack } from "bsmap";

import { BasicTrackMirror, BasicTrackOrder } from "$/constants";
import { BasicEventEffect, EventColor } from "$/types";
import { createDataFactory } from "./factory.helpers";

export function isLightTrack<Track extends IBasicTrack>(trackId: number, tracks: ITrackDefinitions<Track>) {
	return isBasicLightTrack(trackId, tracks);
}
export function isTriggerTrack<Track extends IBasicTrack>(trackId: number, tracks: ITrackDefinitions<Track>) {
	return isBasicNoneTrack(trackId, tracks);
}
export function isValueTrack<Track extends IBasicTrack>(trackId: number, tracks: ITrackDefinitions<Track>) {
	return isBasicToggleTrack(trackId, tracks) || isBasicFloatValueTrack(trackId, tracks) || isBasicIntValueTrack(trackId, tracks) || isBasicBtsTrack(trackId, tracks) || isBasicCarTrack(trackId, tracks);
}

export function isTrackGroupable(trackId: number, environment: EnvironmentName) {
	return Object.values({ ...BasicTrackMirror[environment] }).some((ids) => ids.includes(trackId));
}
export function resolveGroupIdForTrack(trackId: number, environment: EnvironmentName) {
	return Object.entries({ ...BasicTrackMirror[environment] }).find(([_, ids]) => ids.includes(trackId))?.[0];
}
export function resolveGroupTrackIds(trackId: number, environment: EnvironmentName) {
	const group = Object.values({ ...BasicTrackMirror[environment] }).find((ids) => ids.includes(trackId));
	if (!group) return [];
	return group.filter((id) => id !== trackId);
}

export function isBasicEvent(data: unknown): data is IWrapBasicEvent {
	if (typeof data !== "object" || !data) return false;
	return "type" in data;
}
export function isBoostEvent(data: unknown): data is IWrapColorBoostEvent {
	if (typeof data !== "object" || !data) return false;
	return "toggle" in data;
}
export function resolveTrackIdForEvent(data: unknown) {
	if (isBasicEvent(data)) return data.type;
	if (isBoostEvent(data)) return 5;
	throw new Error("Invalid event data.", { cause: data });
}

export function resolveEventId<T extends Pick<IWrapBasicEvent, "time" | "type"> | Pick<IWrapColorBoostEvent, "time" | "toggle">>(x: T) {
	return `${resolveTrackIdForEvent(x)}/${x.time}`;
}

export function isBasicLightEvent<T extends Pick<IWrapBasicEvent, "type">, Track extends IBasicTrack>(data: T, tracks: ITrackDefinitions<Track>) {
	return isBasicEvent(data) && isLightTrack(resolveTrackIdForEvent(data), tracks);
}
export function isBasicTriggerEvent<T extends Pick<IWrapBasicEvent, "type">, Track extends IBasicTrack>(data: T, tracks: ITrackDefinitions<Track>) {
	return isBasicEvent(data) && isTriggerTrack(resolveTrackIdForEvent(data), tracks);
}
export function isBasicValueEvent<T extends Pick<IWrapBasicEvent, "type">, Track extends IBasicTrack>(data: T, tracks: ITrackDefinitions<Track>) {
	return isBasicEvent(data) && isValueTrack(resolveTrackIdForEvent(data), tracks);
}

export function isLightEffectActive(effect: BasicEventEffect) {
	return effect === BasicEventEffect.ON || effect === BasicEventEffect.FLASH || effect === BasicEventEffect.TRANSITION;
}

export function resolveBasicEventColor<T extends Pick<IWrapBasicEvent, "value">>(data: T) {
	if (data.value > 8) return EventColor.WHITE;
	if (data.value > 4) return EventColor.PRIMARY;
	if (data.value > 0) return EventColor.SECONDARY;
	return null;
}
export function resolveBasicEventEffect<T extends Pick<IWrapBasicEvent, "type" | "value">, Track extends IBasicTrack>(data: T, tracks: ITrackDefinitions<Track>) {
	const trackId = resolveTrackIdForEvent(data);

	switch (tracks[trackId]?.type) {
		case -1: {
			return BasicEventEffect.TRIGGER;
		}
		case 0: {
			if (data.value === 0) return BasicEventEffect.OFF;
			if (data.value % 4 === 1) return BasicEventEffect.ON;
			if (data.value % 4 === 2) return BasicEventEffect.FLASH;
			if (data.value % 4 === 3) return BasicEventEffect.FADE;
			if (data.value % 4 === 0) return BasicEventEffect.TRANSITION;
			return BasicEventEffect.OFF;
		}
		default: {
			return BasicEventEffect.VALUE;
		}
	}
}

interface IBasicEventValue {
	effect: BasicEventEffect;
	color?: EventColor | null;
	value?: number;
}
export const { serialize: serializeBasicEventValue, deserialize: deserializeBasicEventValue } = createDataFactory<IBasicEventValue, number, { tracks: ITrackDefinitions<IBasicTrack> }, { tracks: ITrackDefinitions<IBasicTrack>; trackId: number }, { tracks: ITrackDefinitions<IBasicTrack>; trackId: number }>({
	container: {
		serialize: (data) => {
			if (data.effect === BasicEventEffect.TRIGGER) {
				return 0;
			}
			if (data.effect === BasicEventEffect.VALUE) {
				return Math.round(data.value ?? 0);
			}
			if (data.effect === BasicEventEffect.OFF || !data.color) {
				return 0;
			}
			const c = Object.values([EventColor.SECONDARY, EventColor.PRIMARY, EventColor.WHITE]).indexOf(data.color);
			const e = Object.values<BasicEventEffect>([BasicEventEffect.ON, BasicEventEffect.FLASH, BasicEventEffect.FADE, BasicEventEffect.TRANSITION]).indexOf(data.effect);
			return 4 * c + (e + 1);
		},
		deserialize: (value, { tracks, trackId }) => {
			switch (tracks[trackId].type) {
				case -1: {
					return { effect: BasicEventEffect.TRIGGER };
				}
				case 0: {
					return { effect: resolveBasicEventEffect({ type: trackId, value }, tracks), color: resolveBasicEventColor({ value }) };
				}
				default: {
					return { effect: BasicEventEffect.VALUE, value };
				}
			}
		},
	},
});

export function sortBasicTracks<T extends { id: number }>(environment: EnvironmentName) {
	const order = BasicTrackOrder[environment];

	if (!order) return () => 0;

	return (a: T, b: T) => {
		const indexA = order.indexOf(a.id);
		const indexB = order.indexOf(b.id);

		const priorityA = indexA === -1 ? Infinity : indexA;
		const priorityB = indexB === -1 ? Infinity : indexB;

		return priorityA - priorityB;
	};
}
