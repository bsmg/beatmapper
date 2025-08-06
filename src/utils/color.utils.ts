import { parseColor } from "@zag-js/color-utils";

export function isColorDark(value: string): boolean {
	const color = parseColor(value).toFormat("rgba");
	// Calculate luminance using the relative luminance formula
	const luminance = (0.299 * color.getChannelValue("red") + 0.587 * color.getChannelValue("green") + 0.114 * color.getChannelValue("blue")) / 255;
	// Consider the color dark if the luminance is below a threshold (e.g., 0.5)
	return luminance < 0.5;
}
