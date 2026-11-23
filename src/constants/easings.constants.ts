import { EaseType } from "bsmap";

type EaseFn = (t: number) => number;
type EaseValue = (typeof EaseType)[keyof typeof EaseType];
type ScalableEaseFn = (t: number, inOutMultiplier?: number) => number;

function toOut(inFn: EaseFn): EaseFn {
	return (t) => 1 - inFn(1 - t);
}
function toInOut(inFn: ScalableEaseFn): EaseFn {
	return (t) => (t < 0.5 ? inFn(2 * t, 1) / 2 : 1 - inFn(2 - 2 * t, 1) / 2);
}
function toBsInOut(inFn: EaseFn, split: number, cubicScale: number, remapScale = 1, remapOffset = 0): EaseFn {
	const outFn = toOut(inFn);
	return (t) => (t < split ? cubicScale * t * t * t : outFn(remapScale * (t - remapOffset)));
}

function registerFamily(baseEase: number, inFn: ScalableEaseFn): Record<number, EaseFn> {
	return {
		[baseEase]: (t) => inFn(t, 0),
		[baseEase + 1]: toOut((t) => inFn(t, 0)),
		[baseEase + 2]: toInOut(inFn),
	};
}

function inPow(p: number): EaseFn {
	return (t) => t ** p;
}

const inSine: EaseFn = (t) => 1 - Math.cos((t * Math.PI) / 2);
const inExpo: EaseFn = (t) => (t === 0 ? 0 : 2 ** (10 * t - 10));
const inCirc: EaseFn = (t) => 1 - Math.sqrt(1 - t * t);

function inBack(s = 1.70158, inOutMultiplier = 1.525): ScalableEaseFn {
	return (t, useInOut = 0) => {
		const overshoot = useInOut ? s * inOutMultiplier : s;
		return t * t * ((overshoot + 1) * t - overshoot);
	};
}
function inElastic(period = 0.4, phaseOffset = period / 4): EaseFn {
	return (t) => (t === 0 || t === 1 ? t : -(2 ** (10 * (t - 1))) * Math.sin(((t - 1 - phaseOffset) * (2 * Math.PI)) / period));
}
function inBounce(segmentsCount = 4, decay = 0.25): EaseFn {
	const r = Math.sqrt(decay);
	const widths = Array.from({ length: segmentsCount }, (_, i) => (i === 0 ? 1 : 2 * r ** i));
	const totalWidth = widths.reduce((sum, w) => sum + w, 0);

	let cursor = 0;
	const segments = widths.map((w, i) => {
		const start = cursor / totalWidth;
		cursor += w;
		const end = cursor / totalWidth;
		const center = i === 0 ? 0 : (start + end) / 2;
		const floor = 1 - decay ** i;
		return { end, center, floor };
	});

	const gravity = 1 / (segments[0].end * segments[0].end);

	return (t) => {
		const u = 1 - t;
		const seg = segments.find((s) => u <= s.end) ?? segments[segments.length - 1];
		const d = u - seg.center;
		return 1 - (gravity * d * d + seg.floor);
	};
}

export const EASING_FNS = {
	[EaseType.NONE]: (t: number) => Math.floor(t),
	[EaseType.LINEAR]: (t: number) => t,
	...registerFamily(EaseType.IN_QUAD, inPow(2)),
	...registerFamily(EaseType.IN_SINE, inSine),
	...registerFamily(EaseType.IN_CUBIC, inPow(3)),
	...registerFamily(EaseType.IN_QUART, inPow(4)),
	...registerFamily(EaseType.IN_QUINT, inPow(5)),
	...registerFamily(EaseType.IN_EXPO, inExpo),
	...registerFamily(EaseType.IN_CIRC, inCirc),
	...registerFamily(EaseType.IN_BACK, inBack()),
	...registerFamily(EaseType.IN_ELASTIC, inElastic()),
	...registerFamily(EaseType.IN_BOUNCE, inBounce()),
	[EaseType.BS_INOUT_BACK]: toBsInOut(inBack(), 0.517, 5.014, 1.665, 0.4),
	[EaseType.BS_INOUT_ELASTIC]: toBsInOut(inElastic(0.3, -0.2), 0.3, 37.037, 1, 0.2),
	[EaseType.BS_INOUT_BOUNCE]: toBsInOut(inBounce(), 0.36363637, 20.796),
} as Record<EaseValue, EaseFn>;
