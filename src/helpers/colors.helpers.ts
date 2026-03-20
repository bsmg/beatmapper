import { ColorScheme, ColorSchemeVariant, colorToHex, type EnvironmentName, EnvironmentSchemeName, type IColor, type IV2ColorScheme } from "bsmap";

import { BasicEventEffect, ColorSchemeKey, type IColorScheme, ObjectTool } from "$/types";
import { token } from "$:styled-system/tokens";

export const DEFAULT_COLOR_SCHEME: Required<IV2ColorScheme> = {
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
			return colorScheme.colorLeft ?? colorToHex(DEFAULT_COLOR_SCHEME._colorLeft).slice(0, 7);
		}
		case ObjectTool.RIGHT_NOTE: {
			return colorScheme.colorRight ?? colorToHex(DEFAULT_COLOR_SCHEME._colorRight).slice(0, 7);
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			return colorScheme.obstacleColor ?? colorToHex(DEFAULT_COLOR_SCHEME._obstacleColor).slice(0, 7);
		}
		case ColorSchemeKey.ENV_LEFT: {
			return colorScheme.envColorLeft ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorLeft).slice(0, 7);
		}
		case ColorSchemeKey.ENV_RIGHT: {
			return colorScheme.envColorRight ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorRight).slice(0, 7);
		}
		case ColorSchemeKey.ENV_WHITE: {
			return colorScheme.envColorWhite ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorWhite).slice(0, 7);
		}
		case ColorSchemeKey.BOOST_LEFT: {
			return colorScheme.envColorLeftBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorLeftBoost).slice(0, 7);
		}
		case ColorSchemeKey.BOOST_RIGHT: {
			return colorScheme.envColorRightBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorRightBoost).slice(0, 7);
		}
		case ColorSchemeKey.BOOST_WHITE: {
			return colorScheme.envColorWhiteBoost ?? colorToHex(DEFAULT_COLOR_SCHEME._envColorWhiteBoost).slice(0, 7);
		}
		case BasicEventEffect.TRIGGER: {
			return token("colors.green.500");
		}
		case BasicEventEffect.VALUE: {
			return token("colors.blue.500");
		}
		case BasicEventEffect.OFF: {
			return token("colors.slate.400");
		}
		default: {
			throw new Error(`Cannot resolve color for ${item}`);
		}
	}
}

const ColorSchemeFlatVariants = Object.entries(ColorSchemeVariant).reduce((acc: Record<string, Readonly<Omit<IV2ColorScheme, "a">>>, [name, variants]) => {
	for (const [key, data] of Object.entries(variants)) {
		const scheme = ColorScheme[name as keyof typeof ColorScheme];
		acc[key as keyof typeof acc] = { ...scheme, ...data };
	}
	return acc;
}, {});

export function getColorSchemePresets() {
	return { ...ColorScheme, ...ColorSchemeFlatVariants };
}

export function deriveColorSchemeFromEnvironment(environment: EnvironmentName, colorSchemePreset?: string) {
	let envScheme = DEFAULT_COLOR_SCHEME;

	if (environment in EnvironmentSchemeName) {
		envScheme = ColorScheme[EnvironmentSchemeName[environment]] as Required<{ [key in keyof IV2ColorScheme]: Required<IColor> }>;
	}
	if (colorSchemePreset) {
		const Presets = getColorSchemePresets();
		envScheme = Presets[colorSchemePreset as keyof typeof Presets] as Required<{ [key in keyof IV2ColorScheme]: Required<IColor> }>;
	}

	return {
		[ColorSchemeKey.SABER_LEFT]: colorToHex(envScheme._colorLeft).slice(0, 7),
		[ColorSchemeKey.SABER_RIGHT]: colorToHex(envScheme._colorRight).slice(0, 7),
		[ColorSchemeKey.OBSTACLE]: colorToHex(envScheme._obstacleColor).slice(0, 7),
		[ColorSchemeKey.ENV_LEFT]: colorToHex(envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.ENV_RIGHT]: colorToHex(envScheme._envColorRight).slice(0, 7),
		[ColorSchemeKey.ENV_WHITE]: colorToHex(envScheme._envColorWhite ?? DEFAULT_COLOR_SCHEME._envColorWhite).slice(0, 7),
		[ColorSchemeKey.BOOST_LEFT]: colorToHex(envScheme._envColorLeftBoost ?? envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.BOOST_RIGHT]: colorToHex(envScheme._envColorRightBoost ?? envScheme._envColorRight).slice(0, 7),
		[ColorSchemeKey.BOOST_WHITE]: colorToHex(envScheme._envColorWhiteBoost ?? envScheme._envColorWhite ?? DEFAULT_COLOR_SCHEME._envColorWhite).slice(0, 7),
	};
}
