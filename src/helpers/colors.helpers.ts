import { default as Color } from "color";

import { COLORS, COLOR_OVERDRIVE_MULTIPLIER, DEFAULT_COLOR_SCHEME } from "$/constants";
import { App, EventColor, ObjectTool } from "$/types";
import { clamp, normalize } from "$/utils";

export function getColorForItem<T extends string | number>(item: T | undefined, customColors?: App.ModSettings["customColors"]) {
	const customColorsEnabled = !!customColors?.isEnabled;
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			const defaultColor = DEFAULT_COLOR_SCHEME.colorLeft;
			const customColor = customColors?.colorLeft || defaultColor;
			return customColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.RIGHT_NOTE: {
			const defaultColor = DEFAULT_COLOR_SCHEME.colorRight;
			const customColor = customColors?.colorRight || defaultColor;
			return customColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			const defaultColor = DEFAULT_COLOR_SCHEME.obstacleColor;
			const customColor = customColors?.obstacleColor || defaultColor;
			return customColorsEnabled ? customColor : defaultColor;
		}
		case App.BeatmapColorKey.ENV_LEFT:
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY: {
			const defaultColor = DEFAULT_COLOR_SCHEME.envColorLeft;
			const customColor = customColors?.envColorLeft || defaultColor;
			return customColorsEnabled ? customColor : defaultColor;
		}
		case App.BeatmapColorKey.ENV_RIGHT:
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY: {
			const defaultColor = DEFAULT_COLOR_SCHEME.envColorRight;
			const customColor = customColors?.envColorRight || defaultColor;
			return customColorsEnabled ? customColor : defaultColor;
		}
		case App.EventColor.WHITE:
		case EventColor.WHITE: {
			return "white";
		}
		case App.BasicEventType.TRIGGER: {
			return COLORS.green[500];
		}
		case App.BasicEventType.OFF: {
			return COLORS.blueGray[400];
		}
		default: {
			throw new Error(`Cannot resolve color for ${item}`);
		}
	}
}

export function formatColorForMods(element: App.BeatmapColorKey, hex: string, overdrive = 0) {
	// For overdrive: every element ranges from 0 (no overdrive) to 1 (full).
	// Different elements are affected by different amounts, though: left/right environment colors range from 1 to 3, whereas obstacles range from 1 to 10.
	const overdriveMultiple = normalize(overdrive, 0, 1, 1, COLOR_OVERDRIVE_MULTIPLIER[element]);

	const rgb = Color(hex).rgb().unitArray();

	return {
		r: rgb[0] * overdriveMultiple,
		g: rgb[1] * overdriveMultiple,
		b: rgb[2] * overdriveMultiple,
	};
}

// Turn the imported color into a hex string
// This is NOT used for maps re-imported; we use _editorSettings to store the hex values directly. This is done since we lose "overdrive" information when we do it this way :(
// This is only used when importing maps from other editors.
export function formatColorFromImport(rgb: { r: number; g: number; b: number }) {
	const normalizedRgb = [clamp(Math.round(rgb.r * 255), 0, 255), clamp(Math.round(rgb.g * 255), 0, 255), clamp(Math.round(rgb.b * 255), 0, 255)];

	return Color(normalizedRgb).hex();
}
