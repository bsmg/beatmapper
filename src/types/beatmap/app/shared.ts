import type { EntityId } from "@reduxjs/toolkit";

import type { Accept, Member } from "../../utils";

export interface IEntity {
	id: EntityId;
}

export type IEntityMap<T> = { [key in EntityId]: T };

export interface IEditorObject {
	selected?: boolean;
	tentative?: boolean;
}
export type IWrapEditorObject<T> = IEditorObject & Omit<T, "customData">;

export const ColorSchemeKey = {
	SABER_LEFT: "colorLeft",
	SABER_RIGHT: "colorRight",
	OBSTACLE: "obstacleColor",
	ENV_LEFT: "envColorLeft",
	ENV_RIGHT: "envColorRight",
	BOOST_LEFT: "envColorLeftBoost",
	BOOST_RIGHT: "envColorRightBoost",
} as const;
export type ColorSchemeKey = Member<typeof ColorSchemeKey>;

export const SaberColor = {
	LEFT: "red",
	RIGHT: "blue",
} as const;
export type SaberColor = Member<typeof SaberColor>;

export const CutDirection = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right",
	UP_LEFT: "upLeft",
	UP_RIGHT: "upRight",
	DOWN_LEFT: "downLeft",
	DOWN_RIGHT: "downRight",
	ANY: "face",
} as const;
export type CutDirection = Member<typeof CutDirection>;

export const ObstacleType = {
	FULL: "wall",
	TOP: "ceiling",
	EXTENDED: "extension",
} as const;
export type ObstacleType = Member<typeof ObstacleType>;

export const TrackId = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	10: 10,
	11: 11,
	12: 12,
	13: 13,
	14: 14,
	15: 15,
	16: 16,
	17: 17,
	18: 18,
	19: 19,
	40: 40,
	41: 41,
	42: 42,
	43: 43,
	100: 100,
	1000: 1000,
} as const;
export type TrackId = Accept<Member<typeof TrackId>, number>;

export const BasicEventType = {
	OFF: "off",
	ON: "on",
	FLASH: "flash",
	FADE: "fade",
	TRANSITION: "transition",
	TRIGGER: "rotate",
	VALUE: "change-speed",
} as const;
export type BasicEventType = Accept<Member<typeof BasicEventType>, string>;
export type LightEventType = Member<Pick<typeof BasicEventType, "ON" | "OFF" | "FLASH" | "FADE" | "TRANSITION">>;
export type TriggerEventType = Member<Pick<typeof BasicEventType, "TRIGGER">>;
export type ValueEventType = Member<Pick<typeof BasicEventType, "VALUE">>;

export const EventColor = {
	SECONDARY: "blue",
	PRIMARY: "red",
	WHITE: "white",
} as const;
export type EventColor = Member<typeof EventColor>;
