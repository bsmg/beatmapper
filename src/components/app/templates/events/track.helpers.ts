import { sortObjectFn } from "bsmap";
import type { wrapper } from "bsmap/types";

import { type ColorResolverOptions, resolveColorForItem } from "$/helpers/colors.helpers";
import { isLightEffectActive, isLightTrack, resolveBasicEventColor, resolveBasicEventEffect } from "$/helpers/events.helpers";
import { App } from "$/types";
import { ColorSchemeKey, EventColor, type IBackgroundBox, type IEventTracks, type ILightState } from "$/types/editor";
import { clamp, lerp, lerpColor } from "$/utils";

const COLOR_KEY_MAP = {
	[EventColor.PRIMARY]: [ColorSchemeKey.ENV_LEFT],
	[EventColor.SECONDARY]: [ColorSchemeKey.ENV_RIGHT],
	[EventColor.WHITE]: [ColorSchemeKey.ENV_WHITE],
};
export function resolveColorForLightState({ color }: { color: App.EventColor | null }, options: ColorResolverOptions): string | null {
	const key = color !== null ? COLOR_KEY_MAP[color][0] : null;
	if (!key) return null;
	return resolveColorForItem(key, options);
}

interface StateResolverContext extends ColorResolverOptions {
	initialLightState: ILightState;
	offsetInBeats?: number;
}
export function deriveLightStateAtBeat(targetBeat: number, sortedEvents: { data: wrapper.IWrapBasicEvent; effect: App.BasicEventEffect; color: EventColor | null }[], { initialLightState, offsetInBeats = 0, ...options }: StateResolverContext): IBackgroundBox["startState" | "endState"] {
	const nextIdx = sortedEvents.findIndex((e) => e.data.time > targetBeat);

	const currentEvent = nextIdx === -1 ? sortedEvents.at(-1) : sortedEvents[nextIdx - 1];
	const nextEvent = nextIdx !== -1 ? sortedEvents[nextIdx] : null;

	const startTime = currentEvent?.data.time ?? offsetInBeats;
	const startColor = currentEvent?.color ? resolveColorForLightState({ color: currentEvent?.color }, options) : initialLightState.color;
	const startBrightness = currentEvent?.data.floatValue ?? initialLightState.brightness ?? 0;

	if (nextEvent?.effect === App.BasicEventEffect.TRANSITION) {
		const duration = nextEvent.data.time - startTime;
		const ratio = duration > 0 ? clamp((targetBeat - startTime) / duration, 0, 1) : 1;

		const endColor = resolveColorForLightState({ color: nextEvent.color }, options);
		const endBrightness = nextEvent.data.floatValue;

		return {
			color: lerpColor(startColor, endColor, ratio),
			brightness: lerp(startBrightness, endBrightness, ratio),
		};
	}

	const isActive = (currentEvent ? isLightEffectActive(currentEvent.effect) : startColor !== null) && startBrightness > 0;

	return {
		color: isActive ? (startColor ?? "transparent") : "transparent",
		brightness: startBrightness,
	};
}

interface CreateBackgroundBoxesOptions extends StateResolverContext {
	tracks: IEventTracks;
	basicEvents: wrapper.IWrapBasicEvent[];
	startBeat: number;
	endBeat: number;
}
export function createBackgroundBoxes(trackId: number, { tracks, basicEvents, startBeat, endBeat, offsetInBeats, ...rest }: CreateBackgroundBoxesOptions) {
	if (!isLightTrack(trackId, tracks)) return [];

	const sortedEvents = basicEvents.sort(sortObjectFn).map((data) => ({
		data,
		effect: resolveBasicEventEffect(data, tracks),
		color: resolveBasicEventColor(data),
	}));

	const timeline = Array.from(new Set([Math.max(startBeat, offsetInBeats ?? 0), ...sortedEvents.map((e) => e.data.time).filter((t) => t >= startBeat && t < endBeat), endBeat])).sort((a, b) => a - b);
	const statesForTimeline = timeline.map((t) => deriveLightStateAtBeat(t, sortedEvents, { ...rest, offsetInBeats }));

	const backgroundBoxes: IBackgroundBox[] = [];

	for (let i = 0; i < statesForTimeline.length - 1; i++) {
		const startPoint = timeline[i];
		const endPoint = timeline[i + 1];

		const startState = statesForTimeline[i];
		const nextStartState = statesForTimeline[i + 1];

		const nextEvent = sortedEvents.find((e) => e.data.time === endPoint);
		const isTransition = nextEvent?.effect === App.BasicEventEffect.TRANSITION;

		const endState = isTransition ? nextStartState : startState;

		if (startState.brightness > 0 || endState.brightness > 0) {
			backgroundBoxes.push({
				time: startPoint,
				duration: endPoint - startPoint,
				startState: startState,
				endState: endState,
			});
		}
	}

	return backgroundBoxes;
}
