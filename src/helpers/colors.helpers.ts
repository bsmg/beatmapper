import { parseColor } from "@zag-js/color-utils";
import { ColorScheme, EnvironmentSchemeName } from "bsmap";
import type { ColorArray, EnvironmentAllName, IColor, Vector3, Vector4, v2 } from "bsmap/types";

import { token } from "$:styled-system/tokens";
import { App, ColorSchemeKey, EventColor, type IColorScheme, ObjectTool } from "$/types";
import { patchEnvironmentName } from "./packaging.helpers";

export interface ColorResolverOptions {
	customColors: IColorScheme;
}
export function resolveColorForItem<T extends string | number>(item: T | undefined, { customColors: colorScheme }: ColorResolverOptions) {
	const DEFAULT_COLOR_SCHEME = ColorScheme["Default Custom"] as Required<v2.IColorScheme>;
	switch (item) {
		case ObjectTool.LEFT_NOTE: {
			return colorScheme.colorLeft ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._colorLeft);
		}
		case ObjectTool.RIGHT_NOTE: {
			return colorScheme.colorRight ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._colorRight);
		}
		case ObjectTool.BOMB_NOTE: {
			return "#687485";
		}
		case ObjectTool.OBSTACLE: {
			return colorScheme.obstacleColor ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._obstacleColor);
		}
		case App.EventColor.PRIMARY:
		case EventColor.PRIMARY:
		case ColorSchemeKey.ENV_LEFT: {
			return colorScheme.envColorLeft ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._envColorLeft);
		}
		case App.EventColor.SECONDARY:
		case EventColor.SECONDARY:
		case ColorSchemeKey.ENV_RIGHT: {
			return colorScheme.envColorRight ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._envColorRight);
		}
		case ColorSchemeKey.BOOST_LEFT: {
			return colorScheme.envColorLeftBoost ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._envColorLeftBoost);
		}
		case ColorSchemeKey.BOOST_RIGHT: {
			return colorScheme.envColorRightBoost ?? deserializeColorToHex(DEFAULT_COLOR_SCHEME._envColorRightBoost);
		}
		case App.EventColor.WHITE:
		case EventColor.WHITE: {
			return "white";
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

export function serializeColorToObject(value: string, withAlpha: true): Required<IColor>;
export function serializeColorToObject(value: string, withAlpha?: false): IColor;
export function serializeColorToObject(value: string, withAlpha = false): IColor | Required<IColor> {
	const color = parseColor(value).toFormat("rgba");
	const r = color.getChannelValuePercent("red");
	const g = color.getChannelValuePercent("green");
	const b = color.getChannelValuePercent("blue");
	const a = color.getChannelValuePercent("alpha");
	if (withAlpha) return { r, g, b, a };
	return { r, g, b };
}

export function serializeColorToArray(value: string, withAlpha: true): Vector4;
export function serializeColorToArray(value: string, withAlpha?: false): Vector3;
export function serializeColorToArray(value: string, withAlpha = false): ColorArray {
	const color = parseColor(value).toFormat("rgba");
	const r = color.getChannelValuePercent("red");
	const g = color.getChannelValuePercent("green");
	const b = color.getChannelValuePercent("blue");
	const a = color.getChannelValuePercent("alpha");
	if (withAlpha) return [r, g, b, a];
	return [r, g, b];
}

export function deserializeColorToHex<T extends IColor | ColorArray>(value: T) {
	let r: number;
	let g: number;
	let b: number;
	let a: number | undefined;

	if (Array.isArray(value)) {
		r = value[0];
		g = value[1];
		b = value[2];
		a = value[3];
	} else {
		r = value.r;
		g = value.g;
		b = value.b;
		a = value.a;
	}

	const hr = Math.round(r * 255);
	const hg = Math.round(g * 255);
	const hb = Math.round(b * 255);

	const toHex = (c: number): string => {
		const hex = c.toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};

	let hex = `#${toHex(hr)}${toHex(hg)}${toHex(hb)}`;

	if (a !== undefined) {
		const ha = Math.round(a * 255);
		hex += toHex(ha);
	}

	return hex;
}

export function deriveColorSchemeFromEnvironment(environment: EnvironmentAllName) {
	const envScheme = ColorScheme[EnvironmentSchemeName[patchEnvironmentName(environment)]] as Required<{ [key in keyof v2.IColorScheme]: Required<IColor> }>;
	return {
		[ColorSchemeKey.SABER_LEFT]: deserializeColorToHex(envScheme._colorLeft).slice(0, 7),
		[ColorSchemeKey.SABER_RIGHT]: deserializeColorToHex(envScheme._colorRight).slice(0, 7),
		[ColorSchemeKey.OBSTACLE]: deserializeColorToHex(envScheme._obstacleColor).slice(0, 7),
		[ColorSchemeKey.ENV_LEFT]: deserializeColorToHex(envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.ENV_RIGHT]: deserializeColorToHex(envScheme._envColorRight).slice(0, 7),
		[ColorSchemeKey.BOOST_LEFT]: deserializeColorToHex(envScheme._envColorLeftBoost ?? envScheme._envColorLeft).slice(0, 7),
		[ColorSchemeKey.BOOST_RIGHT]: deserializeColorToHex(envScheme._envColorRightBoost ?? envScheme._envColorRight).slice(0, 7),
	};
}
