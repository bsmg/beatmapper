import { ColorScheme, EnvironmentSchemeName } from "bsmap";
import type { EnvironmentAllName, IColor, v2 } from "bsmap/types";
import { colorToHex } from "bsmap/utils";

import { App, ColorSchemeKey, EventColor, type IColorScheme, ObjectTool } from "$/types";
import { token } from "$:styled-system/tokens";

export const DEFAULT_COLOR_SCHEME: Required<v2.IColorScheme> = {
	_colorLeft: { r: 0.7529412, g: 0.1882353, b: 0.1882353 },
	_colorRight: { r: 0.1254902, g: 0.3921569, b: 0.6588235 },
	_envColorLeft: { r: 0.7529412, g: 0.1882353, b: 0.1882353 },
	_envColorRight: { r: 0.1882353, g: 0.5960785, b: 1 },
	_envColorWhite: { r: 1, g: 1, b: 1 },
	_envColorLeftBoost: { r: 0.7529412, g: 0.1882353, b: 0.1882353 },
	_envColorRightBoost: { r: 0.1882353, g: 0.5960785, b: 1 },
	_envColorWhiteBoost: { r: 1, g: 1, b: 1 },
	_obstacleColor: { r: 1, g: 0.1882353, b: 0.1882353 },
};

export interface ColorResolverOptions {
	colorScheme: IColorScheme;
}
export function resolveColorForItem<T extends string | number>(item: T | undefined, { colorScheme }: ColorResolverOptions) {
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			return colorScheme.colorLeft ?? colorToHex(DEFAULT_COLOR_SCHEME._colorLeft);
		}
		case ObjectTool.RIGHT_NOTE: {
			return colorScheme.colorRight ?? colorToHex(DEFAULT_COLOR_SCHEME._colorRight);
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			return colorScheme.obstacleColor ?? colorToHex(DEFAULT_COLOR_SCHEME._obstacleColor);
		}
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY:
		case ColorSchemeKey.ENV_LEFT: {
			return colorScheme.envColorLeft ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorLeft);
		}
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY:
		case ColorSchemeKey.ENV_RIGHT: {
			return colorScheme.envColorRight ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorRight);
		}
		case App.EventColor.WHITE:
		case EventColor.WHITE:
		case ColorSchemeKey.ENV_WHITE: {
			return colorScheme.envColorWhite ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorWhite);
		}
		case ColorSchemeKey.BOOST_LEFT: {
			return colorScheme.envColorLeftBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorLeftBoost);
		}
		case ColorSchemeKey.BOOST_RIGHT: {
			return colorScheme.envColorRightBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorRightBoost);
		}
		case ColorSchemeKey.BOOST_WHITE: {
			return colorScheme.envColorWhiteBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorWhiteBoost);
		}
		case App.BasicEventEffect.TRIGGER: {
			return token("colors.green.500");
		}
		case App.BasicEventEffect.VALUE: {
			return token("colors.blue.500");
		}
		case App.BasicEventEffect.OFF: {
			return token("colors.slate.400");
		}
		default: {
			throw new Error(`Cannot resolve color for ${item}`);
		}
	}
}

export function deriveColorSchemeFromEnvironment(environment: EnvironmentAllName) {
	let envScheme = DEFAULT_COLOR_SCHEME;

	if (environment in EnvironmentSchemeName) {
		envScheme = ColorScheme[EnvironmentSchemeName[environment]] as Required<{ [key in keyof v2.IColorScheme]: Required<IColor> }>;
	}

	return {
		[ColorSchemeKey.SABER_LEFT]: colorToHex(envScheme._colorLeft),
		[ColorSchemeKey.SABER_RIGHT]: colorToHex(envScheme._colorRight),
		[ColorSchemeKey.OBSTACLE]: colorToHex(envScheme._obstacleColor),
		[ColorSchemeKey.ENV_LEFT]: colorToHex(envScheme._envColorLeft),
		[ColorSchemeKey.ENV_RIGHT]: colorToHex(envScheme._envColorRight),
		[ColorSchemeKey.ENV_WHITE]: colorToHex(envScheme._envColorWhite ?? DEFAULT_COLOR_SCHEME._envColorWhite),
		[ColorSchemeKey.BOOST_LEFT]: colorToHex(envScheme._envColorLeftBoost ?? envScheme._envColorLeft),
		[ColorSchemeKey.BOOST_RIGHT]: colorToHex(envScheme._envColorRightBoost ?? envScheme._envColorRight),
		[ColorSchemeKey.BOOST_WHITE]: colorToHex(envScheme._envColorWhiteBoost ?? envScheme._envColorWhite ?? DEFAULT_COLOR_SCHEME._envColorWhite),
	};
}
