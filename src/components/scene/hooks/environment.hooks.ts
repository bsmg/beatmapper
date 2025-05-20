import type { EntityId } from "@reduxjs/toolkit";
import { useMemo, useState } from "react";
import type { ColorRepresentation } from "three";

import { useOnChange } from "$/components/hooks";
import { type ColorResolverOptions, resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveEventColor, resolveEventEffect, resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import { App, type BeatmapId, Quality, type SongId } from "$/types";

function deriveEffectForEvent(lastEvent: App.IBasicEvent | null) {
	if (!lastEvent) return App.BasicEventType.OFF;
	return resolveEventEffect(lastEvent) as App.LightEventType;
}
function deriveColorForEvent(lastEvent: App.IBasicEvent | null, options: ColorResolverOptions): ColorRepresentation {
	const status = deriveEffectForEvent(lastEvent);
	if (!lastEvent) return "#000000";
	if (status === App.BasicEventType.OFF) return "#000000";
	const eventColor = resolveEventColor(lastEvent);
	return resolveColorForItem(eventColor, options);
}
function deriveBrightnessForEvent(lastEvent: App.IBasicEvent | null) {
	if (!lastEvent) return 0;
	return lastEvent.floatValue;
}

interface UseLightPropsOptions {
	sid: SongId;
	bid: BeatmapId;
	lastEvent: App.IBasicEvent | null;
}
export function useLightProps({ sid, bid, lastEvent }: UseLightPropsOptions) {
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const derived = useMemo(() => {
		return {
			lastEventId: lastEvent ? resolveEventId(lastEvent) : null,
			effect: deriveEffectForEvent(lastEvent),
			color: deriveColorForEvent(lastEvent, { customColors: colorScheme }),
			brightness: deriveBrightnessForEvent(lastEvent),
		};
	}, [lastEvent, colorScheme]);

	return { ...derived };
}

export type UseLightPropsReturn = ReturnType<typeof useLightProps>;

export interface UseRingCountOptions {
	count: number;
}
export function useRingCount({ count }: UseRingCountOptions) {
	const quality = useAppSelector(selectGraphicsQuality);

	const numOfRings = useMemo(() => {
		const length = Object.keys(Quality).length;
		const index = Object.values(Quality).indexOf(quality);

		return Math.round(count * ((index + 1) / length));
	}, [count, quality]);

	return numOfRings;
}

export interface UseRingRotationOptions {
	lastEventId: EntityId | null;
	incrementBy?: number;
	ratio?: number;
}
export function useRingRotation({ lastEventId, incrementBy = Math.PI * 0.5, ratio = 0 }: UseRingRotationOptions): [rotationRatio: number] {
	const [rotationRatio, setRotationRatio] = useState(ratio);

	const isPlaying = useAppSelector(selectIsPlaying);

	useOnChange(() => {
		if (!isPlaying || !lastEventId) return;

		const shouldChangeDirection = Math.random() < 0.5;
		const directionMultiple = shouldChangeDirection ? 1 : -1;
		setRotationRatio(rotationRatio + incrementBy * directionMultiple);
	}, lastEventId ?? null);

	return [rotationRatio];
}

export interface UseRingZoomOptions {
	lastEventId: EntityId | null;
	minDistance?: number;
	maxDistance?: number;
}
export function useRingZoom({ lastEventId, minDistance = 3, maxDistance = 12 }: UseRingZoomOptions): [distance: number] {
	const [distanceBetweenRings, setDistanceBetweenRings] = useState(minDistance);

	const isPlaying = useAppSelector(selectIsPlaying);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}

		if (lastEventId) {
			setDistanceBetweenRings(distanceBetweenRings === maxDistance ? minDistance : maxDistance);
		}
	}, lastEventId ?? null);

	return [distanceBetweenRings];
}
