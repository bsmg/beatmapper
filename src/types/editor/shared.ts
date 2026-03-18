import type { EntityId } from "@reduxjs/toolkit";

import type { Member } from "$/types/utils";

export type SongId = EntityId;
export type BeatmapId = EntityId;

export const View = {
	DETAILS: "details",
	BEATMAP: "notes",
	LIGHTSHOW: "events",
	PREVIEW: "preview",
	DOWNLOAD: "download",
} as const;
export type View = Member<typeof View>;

export const ColorSchemeKey = {
	SABER_LEFT: "colorLeft",
	SABER_RIGHT: "colorRight",
	OBSTACLE: "obstacleColor",
	ENV_LEFT: "envColorLeft",
	ENV_RIGHT: "envColorRight",
	ENV_WHITE: "envColorWhite",
	BOOST_LEFT: "envColorLeftBoost",
	BOOST_RIGHT: "envColorRightBoost",
	BOOST_WHITE: "envColorWhiteBoost",
} as const;
export type ColorSchemeKey = Member<typeof ColorSchemeKey>;

export type IColorScheme = {
	[ColorSchemeKey.SABER_LEFT]: string;
	[ColorSchemeKey.SABER_RIGHT]: string;
	[ColorSchemeKey.OBSTACLE]: string;
	[ColorSchemeKey.ENV_LEFT]: string;
	[ColorSchemeKey.ENV_RIGHT]: string;
	[ColorSchemeKey.ENV_WHITE]?: string;
	[ColorSchemeKey.BOOST_LEFT]: string;
	[ColorSchemeKey.BOOST_RIGHT]: string;
	[ColorSchemeKey.BOOST_WHITE]?: string;
};
