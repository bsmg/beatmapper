import { hexToRgba } from "bsmap/utils";

import { token } from "$:styled-system/tokens";
import { COLOR_OVERDRIVE_MULTIPLIER, DEFAULT_COLOR_SCHEME } from "$/constants";
import { App, EventColor, ObjectTool } from "$/types";
import { normalize } from "$/utils";

export function resolveColorForItem<T extends string | number>(item: T | undefined, customColors?: App.ModSettings["customColors"]) {
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
			return token.var("colors.green.500");
		}
		case App.BasicEventType.VALUE: {
			return token.var("colors.blue.500");
		}
		case App.BasicEventType.OFF: {
			return token.var("colors.slate.400");
		}
		default: {
			throw new Error(`Cannot resolve color for ${item}`);
		}
	}
}

export function resolveSchemeColorWithOverdrive(element: App.BeatmapColorKey, hex: string, overdrive = 0) {
	// For overdrive: every element ranges from 0 (no overdrive) to 1 (full).
	// Different elements are affected by different amounts, though: left/right environment colors range from 1 to 3, whereas obstacles range from 1 to 10.
	const overdriveMultiple = normalize(overdrive, 0, 1, 1, COLOR_OVERDRIVE_MULTIPLIER[element]);

	const rgb = hexToRgba(hex);

	return {
		r: rgb[0] * overdriveMultiple,
		g: rgb[1] * overdriveMultiple,
		b: rgb[2] * overdriveMultiple,
	};
}
