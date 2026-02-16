import type { EntityId } from "@reduxjs/toolkit";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useUpdateEffect } from "$/components/hooks/use-update-effect";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveEventColor, resolveEventEffect, resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectPlaying } from "$/store/selectors";
import { App } from "$/types";

interface UseLightEffectOptions {
	lastEvent: App.IBasicEvent | null;
}
export function useLightEffect({ lastEvent }: UseLightEffectOptions) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	return useMemo(() => {
		if (!lastEvent) {
			return { effect: App.BasicEventEffect.OFF, color: "black", brightness: 0 };
		}
		return {
			lastEventId: lastEvent ? resolveEventId(lastEvent) : null,
			effect: resolveEventEffect(lastEvent),
			color: resolveColorForItem(resolveEventColor(lastEvent), { colorScheme }),
			brightness: lastEvent.floatValue,
		};
	}, [lastEvent, colorScheme]);
}

interface UseRingRotationEffectOptions {
	lastEventId: EntityId | null;
	incrementBy?: number;
	ratio?: number;
}
export function useRingRotationEffect({ lastEventId, incrementBy = Math.PI * 0.5, ratio = 0 }: UseRingRotationEffectOptions): [rotationRatio: number] {
	const [rotationRatio, setRotationRatio] = useState(ratio);

	const isPlaying = useAppSelector(selectPlaying);

	useUpdateEffect(() => {
		if (!isPlaying || !lastEventId) return;

		const shouldChangeDirection = Math.random() < 0.5;
		const directionMultiple = shouldChangeDirection ? 1 : -1;

		setRotationRatio(rotationRatio + incrementBy * directionMultiple);
	}, [lastEventId]);

	return [rotationRatio];
}

interface UseRingZoomEffectOptions {
	lastEventId: EntityId | null;
	minDistance?: number;
	maxDistance?: number;
}
export function useRingZoomEffect({ lastEventId, minDistance = 3, maxDistance = 12 }: UseRingZoomEffectOptions): [distance: number] {
	const [distanceBetweenRings, setDistanceBetweenRings] = useState(minDistance);

	const isPlaying = useAppSelector(selectPlaying);

	useUpdateEffect(() => {
		if (!isPlaying || !lastEventId) return;

		setDistanceBetweenRings(distanceBetweenRings === maxDistance ? minDistance : maxDistance);
	}, [lastEventId]);

	return [distanceBetweenRings];
}
