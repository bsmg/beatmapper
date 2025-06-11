import { ColorSchemeKey } from "$/types";

export const BEATMAP_COLOR_KEY_RENAME = {
	[ColorSchemeKey.SABER_LEFT]: "Left Saber",
	[ColorSchemeKey.SABER_RIGHT]: "Right Saber",
	[ColorSchemeKey.ENV_LEFT]: "Environment 1",
	[ColorSchemeKey.ENV_RIGHT]: "Environment 2",
	[ColorSchemeKey.BOOST_LEFT]: "Boost 1",
	[ColorSchemeKey.BOOST_RIGHT]: "Boost 2",
	[ColorSchemeKey.OBSTACLE]: "Obstacles",
} as const;
