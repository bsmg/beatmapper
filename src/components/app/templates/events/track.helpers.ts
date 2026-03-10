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
const BOOST_COLOR_KEY_MAP = {
	[EventColor.PRIMARY]: [ColorSchemeKey.BOOST_LEFT],
	[EventColor.SECONDARY]: [ColorSchemeKey.BOOST_RIGHT],
	[EventColor.WHITE]: [ColorSchemeKey.BOOST_WHITE],
};
export function resolveColorForLightState({ color, isBoosted }: { color: App.EventColor | null; isBoosted: boolean }, options: ColorResolverOptions): string | null {
	const key = color !== null ? (isBoosted ? BOOST_COLOR_KEY_MAP : COLOR_KEY_MAP)[color][0] : null;
	if (!key) return null;
	return resolveColorForItem(key, options);
}

interface StateResolverContext extends ColorResolverOptions {
	initialLightState: ILightState;
	offsetInBeats?: number;
}
export function deriveLightStateAtBeat(
	targetBeat: number,
	currentEvent: { data: wrapper.IWrapBasicEvent; effect: App.BasicEventEffect; color: EventColor | null } | undefined,
	nextEvent: { data: wrapper.IWrapBasicEvent; effect: App.BasicEventEffect; color: EventColor | null } | undefined,
	{ initialLightState, offsetInBeats = 0, isBoosted, ...options }: StateResolverContext & { isBoosted: boolean },
): IBackgroundBox["startState" | "endState"] {
	const isActive = currentEvent ? isLightEffectActive(currentEvent.effect) : false;

	const startTime = currentEvent?.data.time ?? offsetInBeats;
	const startBrightness = isActive ? (currentEvent?.data.floatValue ?? initialLightState.brightness ?? 0) : 0;
	const startColor = currentEvent?.color ? resolveColorForLightState({ color: currentEvent.color, isBoosted }, options) : initialLightState.color;

	if (nextEvent?.effect === App.BasicEventEffect.TRANSITION) {
		const duration = nextEvent.data.time - startTime;
		const ratio = duration > 0 ? clamp((targetBeat - startTime) / duration, 0, 1) : 1;

		return {
			color: lerpColor(startColor, resolveColorForLightState({ color: nextEvent.color, isBoosted }, options), ratio),
			brightness: lerp(startBrightness, nextEvent.data.floatValue, ratio),
		};
	}

	return {
		color: isActive ? (startColor ?? "transparent") : "transparent",
		brightness: startBrightness,
	};
}

function deriveBoostStateAtBeat(targetBeat: number, boostEvents: wrapper.IWrapColorBoostEvent[], initialBoostState: boolean): boolean {
	let activeBoost = initialBoostState;
	for (const event of boostEvents) {
		if (event.time > targetBeat) break;
		activeBoost = event.toggle;
	}
	return activeBoost;
}

interface CreateBackgroundBoxesOptions extends StateResolverContext {
	tracks: IEventTracks;
	basicEvents: wrapper.IWrapBasicEvent[];
	boostEvents: wrapper.IWrapColorBoostEvent[];
	startBeat: number;
	endBeat: number;
}
export function createBackgroundBoxes(trackId: number, { tracks, basicEvents, boostEvents, startBeat, endBeat, offsetInBeats, ...rest }: CreateBackgroundBoxesOptions) {
	if (!isLightTrack(trackId, tracks)) return [];

	const sortedEvents = [...basicEvents].sort(sortObjectFn).map((data) => ({
		data,
		effect: resolveBasicEventEffect(data, tracks),
		color: resolveBasicEventColor(data),
	}));

	const timeline = Array.from(new Set([Math.max(startBeat, offsetInBeats ?? 0), ...sortedEvents.map((e) => e.data.time).filter((t) => t >= startBeat && t < endBeat), ...boostEvents.map((e) => e.time).filter((t) => t >= startBeat && t < endBeat), endBeat])).sort((a, b) => a - b);

	const backgroundBoxes: IBackgroundBox[] = [];

	for (let i = 0; i < timeline.length - 1; i++) {
		const startPoint = timeline[i];
		const endPoint = timeline[i + 1];

		const currentEvent = [...sortedEvents].reverse().find((e) => e.data.time <= startPoint);
		const nextEvent = sortedEvents.find((e) => e.data.time > startPoint);
		const isTransition = nextEvent?.effect === App.BasicEventEffect.TRANSITION;

		const isBoosted = deriveBoostStateAtBeat(startPoint, boostEvents, false);

		const startState = deriveLightStateAtBeat(startPoint, currentEvent, nextEvent, { ...rest, isBoosted });
		const endState = isTransition ? deriveLightStateAtBeat(endPoint, currentEvent, nextEvent, { ...rest, isBoosted }) : startState;

		if (startState.brightness > 0 || endState.brightness > 0) {
			backgroundBoxes.push({
				time: startPoint,
				duration: endPoint - startPoint,
				startState,
				endState,
			});
		}
	}

	return backgroundBoxes;
}
