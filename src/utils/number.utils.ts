export function sum(values: number[]) {
	return values.reduce((sum, value) => sum + value, 0);
}
export function mean(values: number[]) {
	return sum(values) / values.length;
}

export function clamp(val: number, min = 0, max = 1) {
	return Math.max(min, Math.min(max, val));
}

export function roundTo(number: number, places = 0) {
	return Math.round(number * 10 ** places) / 10 ** places;
}
export function roundToNearest(number: number, nearest: number) {
	return Math.round(number / nearest) * nearest;
}
export function roundAwayFloatingPointNonsense(n: number) {
	return roundToNearest(n, 1 / 1000000);
}
export function floorToNearest(number: number, nearest: number) {
	return Math.floor(number / nearest) * nearest;
}

/**
 * I often find myself needing to normalize values.
 * Say I have a value, 15, out of a range between 0 and 30. I might want to know what that is on a scale of 1-5 instead.
 */
export function normalize(number: number, currentScaleMin: number, currentScaleMax: number, newScaleMin = 0, newScaleMax = 1) {
	// First, normalize the value between 0 and 1.
	const standardNormalization = (number - currentScaleMin) / (currentScaleMax - currentScaleMin);
	// Next, transpose that value to our desired scale.
	return (newScaleMax - newScaleMin) * standardNormalization + newScaleMin;
}

export function getInterpolatedValue(y1: number, y2: number, ratio: number) {
	// We're assuming that `ratio` is a value between 0 and 1. If this were a graph, it'd be our `x`, and we're trying to solve for `y`.
	// First, find the slope of our line.
	const slope = y2 - y1;

	return slope * ratio + y1;
}

export function mix(v1: number, v2: number, ratio = 0.5) {
	return v1 * ratio + v2 * (1 - ratio);
}
