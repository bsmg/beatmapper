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
