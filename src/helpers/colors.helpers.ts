import { ColorScheme, EnvironmentSchemeName } from "bsmap";
import type { EnvironmentAllName, IColor, v2 } from "bsmap/types";
import { colorToHex, hexToRgba } from "bsmap/utils";

import { token } from "$:styled-system/tokens";
import { App, EventColor, ObjectTool } from "$/types";

export interface ColorResolverOptions {
	customColors: App.IColorScheme;
}
export function resolveColorForItem<T extends string | number>(item: T | undefined, { customColors: colorScheme }: ColorResolverOptions) {
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			return colorScheme.colorLeft;
		}
		case ObjectTool.RIGHT_NOTE: {
			return colorScheme.colorRight;
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			return colorScheme.obstacleColor;
		}
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY:
		case App.ColorSchemeKey.ENV_LEFT: {
			return colorScheme.envColorLeft;
		}
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY:
		case App.ColorSchemeKey.ENV_RIGHT: {
			return colorScheme.envColorRight;
		}
		case App.ColorSchemeKey.BOOST_LEFT: {
			return colorScheme.envColorLeftBoost;
		}
		case App.ColorSchemeKey.BOOST_RIGHT: {
			return colorScheme.envColorRightBoost;
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

export function serializeColorElement(hex: string) {
	const [r, g, b] = hexToRgba(hex);
	return { r, g, b, a: 1 };
}

export function deriveColorSchemeFromEnvironment(environment: EnvironmentAllName) {
	const envScheme = ColorScheme[EnvironmentSchemeName[environment]] as Required<{ [key in keyof v2.IColorScheme]: Required<IColor> }>;
	return {
		[App.ColorSchemeKey.SABER_LEFT]: colorToHex(envScheme._colorLeft).slice(0, 7),
		[App.ColorSchemeKey.SABER_RIGHT]: colorToHex(envScheme._colorRight).slice(0, 7),
		[App.ColorSchemeKey.OBSTACLE]: colorToHex(envScheme._obstacleColor).slice(0, 7),
		[App.ColorSchemeKey.ENV_LEFT]: colorToHex(envScheme._envColorLeft).slice(0, 7),
		[App.ColorSchemeKey.ENV_RIGHT]: colorToHex(envScheme._envColorRight).slice(0, 7),
		[App.ColorSchemeKey.BOOST_LEFT]: colorToHex(envScheme._envColorLeftBoost ?? envScheme._envColorLeft).slice(0, 7),
		[App.ColorSchemeKey.BOOST_RIGHT]: colorToHex(envScheme._envColorRightBoost ?? envScheme._envColorRight).slice(0, 7),
	};
}
