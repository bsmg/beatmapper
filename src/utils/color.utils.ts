import { parseColor } from "@zag-js/color-utils";

import { lerp } from "./number.utils";

export function isColorDark(value: string): boolean {
	const color = parseColor(value).toFormat("rgba");
	// Calculate luminance using the relative luminance formula
	const luminance = (0.299 * color.getChannelValue("red") + 0.587 * color.getChannelValue("green") + 0.114 * color.getChannelValue("blue")) / 255;
	// Consider the color dark if the luminance is below a threshold (e.g., 0.5)
	return luminance < 0.5;
}

export function lerpColor(startHex: string | null, endHex: string | null, t: number): string {
	if (!startHex || !endHex) {
		// If one side is missing, we treat it as "transparent/black" or just snap
		if (!startHex && endHex) return endHex;
		if (!endHex && startHex) return startHex;

		throw new Error("Cannot interpolate");
	}

	const parse = (hex: string) => {
		const n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
	};

	const c1 = parse(startHex);
	const c2 = parse(endHex);

	const r = Math.round(lerp(c1[0], c2[0], t));
	const g = Math.round(lerp(c1[1], c2[1], t));
	const b = Math.round(lerp(c1[2], c2[2], t));

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
