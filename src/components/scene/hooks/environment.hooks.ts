import { useParams } from "@tanstack/react-router";
import type { wrapper } from "bsmap/types";
import { useCallback, useMemo, useState } from "react";

import { useUpdateEffect } from "$/components/hooks/use-update-effect";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveBasicEventColor, resolveBasicEventEffect, resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventTracksForEnvironment, selectPlaying } from "$/store/selectors";
import { App } from "$/types";

interface UseLightEffectOptions {
	lastEvent: wrapper.IWrapBasicEvent | null;
}
export function useLightEffect({ lastEvent }: UseLightEffectOptions) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const deriveEffectForEvent = useCallback(
		function deriveEffectForEvent(lastEvent: App.IBasicEvent | null) {
			if (!lastEvent) {
				return App.BasicEventEffect.OFF;
			}
			return resolveBasicEventEffect(lastEvent, tracks);
		},
		[tracks],
	);
	const deriveColorForEvent = useCallback(
		function deriveColorForEvent(lastEvent: App.IBasicEvent | null): string {
			if (!lastEvent || deriveEffectForEvent(lastEvent) === App.BasicEventEffect.OFF) {
				return "#000000";
			}
			return resolveColorForItem(resolveBasicEventColor(lastEvent), { colorScheme });
		},
		[deriveEffectForEvent, colorScheme],
	);

	return useMemo(() => {
		if (!lastEvent) {
			return { effect: App.BasicEventEffect.OFF, color: "black", brightness: 0 };
		}

		return {
			lastEventId: lastEvent ? resolveEventId(lastEvent) : null,
			effect: deriveEffectForEvent(lastEvent),
			color: deriveColorForEvent(lastEvent),
			brightness: lastEvent.floatValue,
		};
	}, [lastEvent, deriveEffectForEvent, deriveColorForEvent]);
}

interface UseRingRotationEffectOptions {
	lastEvent: wrapper.IWrapBasicEvent | null;
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
	lastEvent: wrapper.IWrapBasicEvent | null;
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
