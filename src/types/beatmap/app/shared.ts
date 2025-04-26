import type { EntityId } from "@reduxjs/toolkit";

import type { Accept, Member } from "../../utils";

export interface IEntity {
	id: EntityId;
}

export interface IEditorObject {
	selected?: boolean;
	tentative?: boolean;
}

export const BeatmapColorKey = {
	SABER_LEFT: "colorLeft",
	SABER_RIGHT: "colorRight",
	ENV_LEFT: "envColorLeft",
	ENV_RIGHT: "envColorRight",
	OBSTACLE: "obstacleColor",
} as const;
export type BeatmapColorKey = Member<typeof BeatmapColorKey>;

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
	0: "laserBack",
	1: "trackNeons",
	2: "laserLeft",
	3: "laserRight",
	4: "primaryLight",
	5: "boost",
	6: "laserLeft2",
	7: "laserRight2",
	8: "largeRing",
	9: "smallRing",
	10: "laserLeft3",
	11: "laserRight3",
	12: "laserSpeedLeft",
	13: "laserSpeedRight",
	14: "earlyRotation",
	15: "lateRotation",
	16: "utility1",
	17: "utility2",
	18: "utility3",
	19: "utility4",
	40: "special1",
	41: "special2",
	42: "special3",
	43: "special4",
	100: "bpmChange",
	1000: "njsChange",
} as const;
export type TrackId = Member<typeof TrackId>;

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
