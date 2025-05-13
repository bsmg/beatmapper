import { ColorScheme, EnvironmentSchemeName } from "bsmap";
import type { EnvironmentAllName } from "bsmap/types";
import { colorToHex, hexToRgba } from "bsmap/utils";

import { token } from "$:styled-system/tokens";
import { COLOR_OVERDRIVE_MULTIPLIER, DEFAULT_MOD_SETTINGS } from "$/constants";
import { App, EventColor, ObjectTool } from "$/types";
import { normalize } from "$/utils";

interface ColorResolverOptions {
	environment: EnvironmentAllName;
	customColors: App.ModSettings["customColors"];
}
export function resolveColorForItem<T extends string | number>(item: T | undefined, { environment, customColors }: ColorResolverOptions) {
	const { isEnabled: isCustomColorsEnabled, ...customColorScheme } = customColors ?? DEFAULT_MOD_SETTINGS.customColors;

	const envScheme = environment ? ColorScheme[EnvironmentSchemeName[environment]] : {};

	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			const defaultColor = envScheme?._colorLeft ? colorToHex(envScheme._colorLeft) : customColorScheme.colorLeft;
			const customColor = customColors?.colorLeft || defaultColor;
			return isCustomColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.RIGHT_NOTE: {
			const defaultColor = envScheme?._colorRight ? colorToHex(envScheme._colorRight) : customColorScheme.colorRight;
			const customColor = customColors?.colorRight || defaultColor;
			return isCustomColorsEnabled ? customColor : defaultColor;
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			const defaultColor = envScheme?._obstacleColor ? colorToHex(envScheme._obstacleColor) : customColorScheme.obstacleColor;
			const customColor = customColors?.obstacleColor || defaultColor;
			return isCustomColorsEnabled ? customColor : defaultColor;
		}
		case App.BeatmapColorKey.ENV_LEFT:
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY: {
			const defaultColor = envScheme?._envColorLeft ? colorToHex(envScheme._envColorLeft) : customColorScheme.envColorLeft;
			const customColor = customColors?.envColorLeft || defaultColor;
			return isCustomColorsEnabled ? customColor : defaultColor;
		}
		case App.BeatmapColorKey.ENV_RIGHT:
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY: {
			const defaultColor = envScheme?._envColorRight ? colorToHex(envScheme._envColorRight) : customColorScheme.envColorRight;
			const customColor = customColors?.envColorRight || defaultColor;
			return isCustomColorsEnabled ? customColor : defaultColor;
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
