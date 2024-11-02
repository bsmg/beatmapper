import { default as Color } from "color";

import { COLORS, COLOR_ELEMENT_DATA, DEFAULT_BLUE, DEFAULT_LIGHT_BLUE, DEFAULT_LIGHT_RED, DEFAULT_OBSTACLE, DEFAULT_RED } from "$/constants";
import { App, EventColor, ObjectTool } from "$/types";
import { clamp, normalize } from "$/utils";

export function getColorForItem<T extends string | number>(item: T | undefined, song: App.Song) {
	const customColorsEnabled = !!song.modSettings.customColors?.isEnabled;

	switch (item) {
		// In our notes view, the tool will be labeled "left-block", while the underlying data structure treats colors as a number: 0, 1, 3.
		case ObjectTool.LEFT_NOTE:
		case 0: {
			const defaultColor = DEFAULT_RED;
			const customColor = song.modSettings.customColors?.colorLeft || defaultColor;

			return customColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.RIGHT_NOTE:
		case 1: {
			const defaultColor = DEFAULT_BLUE;
			const customColor = song.modSettings.customColors?.colorRight || defaultColor;

			return customColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.BOMB_NOTE:
		case 3: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			const defaultColor = DEFAULT_OBSTACLE;
			const customColor = song.modSettings.customColors?.obstacleColor || defaultColor;

			return customColorsEnabled ? customColor : defaultColor;
		}

		// In the events view, our formal name is `envColorLeft`, but the events themselves still use the original colors 'red' / 'blue'.
		case App.BeatmapColorKey.ENV_LEFT:
		case App.EventColorType.PRIMARY:
		case EventColor.PRIMARY: {
			const defaultColor = DEFAULT_LIGHT_RED;
			const customColor = song.modSettings.customColors?.envColorLeft || defaultColor;

			return customColorsEnabled ? customColor : defaultColor;
		}
		case App.BeatmapColorKey.ENV_RIGHT:
		case App.EventColorType.SECONDARY:
		case EventColor.SECONDARY: {
			const defaultColor = DEFAULT_LIGHT_BLUE;
			const customColor = song.modSettings.customColors?.envColorRight || defaultColor;

			return customColorsEnabled ? customColor : defaultColor;
		}

		// Event view has two other event types: rotate and off. They have unique colors.
		case App.EventType.TRIGGER:
			return COLORS.green[500];
		case App.EventType.OFF:
			return COLORS.blueGray[400];

		default:
			return undefined;
	}
}

export function formatColorForMods(element: App.BeatmapColorKey, hex: string, overdrive = 0) {
	// For overdrive: every element ranges from 0 (no overdrive) to 1 (full).
	// Different elements are affected by different amounts, though: left/right environment colors range from 1 to 3, whereas obstacles range from 1 to 10.
	const overdriveMultiple = normalize(overdrive, 0, 1, 1, COLOR_ELEMENT_DATA[element].maxValue);

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
