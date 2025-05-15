import { App } from "$/types";

export const BEATMAP_COLOR_KEY_RENAME = {
	[App.ColorSchemeKey.SABER_LEFT]: "Left Saber",
	[App.ColorSchemeKey.SABER_RIGHT]: "Right Saber",
	[App.ColorSchemeKey.ENV_LEFT]: "Environment 1",
	[App.ColorSchemeKey.ENV_RIGHT]: "Environment 2",
	[App.ColorSchemeKey.BOOST_LEFT]: "Boost 1",
	[App.ColorSchemeKey.BOOST_RIGHT]: "Boost 2",
	[App.ColorSchemeKey.OBSTACLE]: "Obstacles",
} as const;
