import { parseColor } from "@ark-ui/react/color-picker";
import { ColorScheme, EnvironmentSchemeName } from "bsmap";
import type { EnvironmentAllName, IColor, v2 } from "bsmap/types";
import { colorToHex, hexToRgba } from "bsmap/utils";

import { token } from "$:styled-system/tokens";
import { DEFAULT_COLOR_SCHEME } from "$/constants";
import { App, ColorSchemeKey, EventColor, type IColorScheme, ObjectTool } from "$/types";
import { patchEnvironmentName } from "./packaging.helpers";

export interface ColorResolverOptions {
	customColors: IColorScheme;
}
export function resolveColorForItem<T extends string | number>(item: T | undefined, { customColors: colorScheme }: ColorResolverOptions) {
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			return colorScheme.colorLeft ?? DEFAULT_COLOR_SCHEME.colorLeft;
		}
		case ObjectTool.RIGHT_NOTE: {
			return colorScheme.colorRight ?? DEFAULT_COLOR_SCHEME.colorRight;
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			return colorScheme.obstacleColor ?? DEFAULT_COLOR_SCHEME.obstacleColor;
		}
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY:
		case ColorSchemeKey.ENV_LEFT: {
			return colorScheme.envColorLeft ?? DEFAULT_COLOR_SCHEME.envColorLeft;
		}
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY:
		case ColorSchemeKey.ENV_RIGHT: {
			return colorScheme.envColorRight ?? DEFAULT_COLOR_SCHEME.envColorRight;
		}
		case ColorSchemeKey.BOOST_LEFT: {
			return colorScheme.envColorLeftBoost ?? DEFAULT_COLOR_SCHEME.envColorLeftBoost;
		}
		case ColorSchemeKey.BOOST_RIGHT: {
			return colorScheme.envColorRightBoost ?? DEFAULT_COLOR_SCHEME.envColorRightBoost;
		}
		case App.EventColor.WHITE:
		case EventColor.WHITE: {
			return "white";
		}
		case App.BasicEventEffect.TRIGGER: {
			return token.var("colors.green.500");
		}
		case App.BasicEventEffect.VALUE: {
			return token.var("colors.blue.500");
		}
		case App.BasicEventEffect.OFF: {
			return token.var("colors.slate.400");
		}
		default: {
			throw new Error(`Cannot resolve color for ${item}`);
		}
	}
}

export function serializeColorElement(value: string) {
	const hex = parseColor(value).toHexInt().toString(16);
	const [r, g, b] = hexToRgba(hex);
	return { r, g, b, a: 1 };
}

export function deriveColorSchemeFromEnvironment(environment: EnvironmentAllName) {
	const envScheme = ColorScheme[EnvironmentSchemeName[patchEnvironmentName(environment)]] as Required<{ [key in keyof v2.IColorScheme]: Required<IColor> }>;
	return {
		[ColorSchemeKey.SABER_LEFT]: colorToHex(envScheme._colorLeft).slice(0, 7),
		[ColorSchemeKey.SABER_RIGHT]: colorToHex(envScheme._colorRight).slice(0, 7),
		[ColorSchemeKey.OBSTACLE]: colorToHex(envScheme._obstacleColor).slice(0, 7),
		[ColorSchemeKey.ENV_LEFT]: colorToHex(envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.ENV_RIGHT]: colorToHex(envScheme._envColorRight).slice(0, 7),
		[ColorSchemeKey.BOOST_LEFT]: colorToHex(envScheme._envColorLeftBoost ?? envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.BOOST_RIGHT]: colorToHex(envScheme._envColorRightBoost ?? envScheme._envColorRight).slice(0, 7),
	};
}
