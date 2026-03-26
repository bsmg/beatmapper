import { useParams } from "@tanstack/react-router";
import type { IWrapBasicEvent, IWrapColorBoostEvent } from "bsmap";
import { useCallback, useMemo, useState } from "react";

import { resolveColorForLightState } from "$/components/app/templates/events/track.helpers";
import { useUpdateEffect } from "$/components/hooks/use-update-effect";
import { resolveBasicEventColor, resolveBasicEventEffect, resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventTracksForEnvironment, selectPlaying } from "$/store/selectors";
import { type App, BasicEventEffect, type EventColor, type ILightState } from "$/types";

interface UseLightEffectOptions {
	lastEvent: IWrapBasicEvent | null;
	nextEvent: IWrapBasicEvent | null;
	lastBoostEvent: IWrapColorBoostEvent | null;
}
export function useLightEffect({ lastEvent, nextEvent, lastBoostEvent }: UseLightEffectOptions) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const deriveEffectForEvent = useCallback(
		(event: App.IBasicEvent | null): BasicEventEffect => {
			if (!event) {
				return BasicEventEffect.OFF;
			}
			return resolveBasicEventEffect(event, tracks);
		},
		[tracks],
	);
	const deriveColorForEvent = useCallback(
		(event: App.IBasicEvent | null): EventColor | null => {
			const effect = deriveEffectForEvent(event);

			if (!event || effect === BasicEventEffect.OFF) {
				return null;
			}
			return resolveBasicEventColor(event);
		},
		[deriveEffectForEvent],
	);
	const deriveBrightnessForEvent = useCallback(
		(event: App.IBasicEvent | null): number => {
			const effect = deriveEffectForEvent(event);

			if (!event || effect === BasicEventEffect.OFF) {
				return 0;
			}
			return event.floatValue;
		},
		[deriveEffectForEvent],
	);

	const deriveStateForEvent = useCallback(
		(event: App.IBasicEvent | null): { [key in keyof ILightState]: NonNullable<ILightState[key]> } => {
			if (!event) {
				return { color: "black", brightness: 0 };
			}

			const color = deriveColorForEvent(event);
			const brightness = deriveBrightnessForEvent(event);

			return {
				color: color ? (resolveColorForLightState({ color, isBoosted: !!lastBoostEvent?.toggle }, { colorScheme }) ?? "black") : "black",
				brightness: brightness,
			};
		},
		[deriveColorForEvent, deriveBrightnessForEvent, lastBoostEvent, colorScheme],
	);

	return useMemo(() => {
		return {
			lastEventId: lastEvent ? resolveEventId(lastEvent) : null,
			time: lastEvent?.time ?? 0,
			duration: (nextEvent?.time ?? 0) - (lastEvent?.time ?? 0),
			lastEffect: deriveEffectForEvent(lastEvent),
			nextEffect: deriveEffectForEvent(nextEvent),
			prevState: deriveStateForEvent(lastEvent),
			nextState: deriveStateForEvent(nextEvent),
		};
	}, [lastEvent, nextEvent, deriveEffectForEvent, deriveStateForEvent]);
}

interface UseRingRotationEffectOptions {
	lastEvent: IWrapBasicEvent | null;
	incrementBy?: number;
	ratio?: number;
}
export function useRingRotationEffect({ lastEvent, incrementBy = Math.PI * 0.5, ratio = 0 }: UseRingRotationEffectOptions): [rotationRatio: number] {
	const [rotationRatio, setRotationRatio] = useState(ratio);

	const isPlaying = useAppSelector(selectPlaying);

	const lastEventId = useMemo(() => (lastEvent ? resolveEventId(lastEvent) : null), [lastEvent]);

	useUpdateEffect(() => {
		if (!isPlaying || !lastEventId) return;

		const shouldChangeDirection = Math.random() < 0.5;
		const directionMultiple = shouldChangeDirection ? 1 : -1;

		setRotationRatio(rotationRatio + incrementBy * directionMultiple);
	}, [lastEventId]);

	return [rotationRatio];
}

interface UseRingZoomEffectOptions {
	lastEvent: IWrapBasicEvent | null;
	minDistance?: number;
	maxDistance?: number;
}
export function useRingZoomEffect({ lastEvent, minDistance = 3, maxDistance = 12 }: UseRingZoomEffectOptions): [distance: number] {
	const [distanceBetweenRings, setDistanceBetweenRings] = useState(minDistance);

	const isPlaying = useAppSelector(selectPlaying);

	const lastEventId = useMemo(() => (lastEvent ? resolveEventId(lastEvent) : null), [lastEvent]);

	useUpdateEffect(() => {
		if (!isPlaying || !lastEventId) return;

		setDistanceBetweenRings(distanceBetweenRings === maxDistance ? minDistance : maxDistance);
	}, [lastEventId]);

	return [distanceBetweenRings];
}
