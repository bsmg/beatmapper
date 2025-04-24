import { useMemo, useState } from "react";

import { useOnChange } from "$/components/hooks";
import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import { App, Quality, type SongId } from "$/types";

interface UseLightPropsOptions {
	sid: SongId;
	lastEvent: App.IBasicLightEvent | null;
}
export function useLightProps({ sid, lastEvent }: UseLightPropsOptions) {
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));

	const lightStatus = useMemo(() => (lastEvent ? lastEvent.type : App.BasicEventType.OFF), [lastEvent]);
	const lightColor = useMemo(() => (lightStatus === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastEvent?.colorType, customColors)), [lastEvent, lightStatus, customColors]);

	return { lastEventId: lastEvent?.id ?? null, status: lightStatus, color: lightColor };
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
	lastEventId: App.BasicEvent["id"] | null | undefined;
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
	lastEventId: App.BasicEvent["id"] | null | undefined;
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
