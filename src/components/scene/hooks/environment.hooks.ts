import type { EntityId } from "@reduxjs/toolkit";
import { useMemo, useState } from "react";

import { useOnChange } from "$/components/hooks";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveEventColor, resolveEventEffect, resolveEventId } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectEnvironment, selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import { App, Quality, type SongId } from "$/types";

interface UseLightPropsOptions {
	sid: SongId;
	lastEvent: App.IBasicEvent | null;
}
export function useLightProps({ sid, lastEvent }: UseLightPropsOptions) {
	const environment = useAppSelector((state) => selectEnvironment(state, sid));
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));

	const lightStatus = useMemo(() => {
		if (!lastEvent) return App.BasicEventType.OFF;
		return resolveEventEffect(lastEvent) as App.LightEventType;
	}, [lastEvent]);

	const lightColor = useMemo(() => {
		if (!lastEvent) return "#000000";
		if (lightStatus === App.BasicEventType.OFF) return "#000000";
		const eventColor = resolveEventColor(lastEvent);
		return resolveColorForItem(eventColor, { environment, customColors });
	}, [lastEvent, lightStatus, environment, customColors]);

	return { lastEventId: lastEvent ? resolveEventId(lastEvent) : null, status: lightStatus, color: lightColor };
}

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
	lastEventId: EntityId | null | undefined;
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
	lastEventId: EntityId | null | undefined;
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
