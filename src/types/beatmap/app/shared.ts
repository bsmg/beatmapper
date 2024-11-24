import type { Accept, Member } from "../../utils";

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
	8: "largeRing",
	9: "smallRing",
	12: "laserSpeedLeft",
	13: "laserSpeedRight",
} as const;
export type TrackId = Member<typeof TrackId>;
export type LightTrackId = Member<Pick<typeof TrackId, 0 | 1 | 2 | 3 | 4>>;
export type TriggerTrackId = Member<Pick<typeof TrackId, 8 | 9>>;
export type ValueTrackId = Member<Pick<typeof TrackId, 12 | 13>>;

export const BasicEventType = {
	ON: "on",
	OFF: "off",
	FLASH: "flash",
	FADE: "fade",
	TRIGGER: "rotate",
	VALUE: "change-speed",
} as const;
export type BasicEventType = Accept<Member<typeof BasicEventType>, string>;
export type LightEventType = Member<Pick<typeof BasicEventType, "ON" | "OFF" | "FLASH" | "FADE">>;
export type TriggerEventType = Member<Pick<typeof BasicEventType, "TRIGGER">>;
export type ValueEventType = Member<Pick<typeof BasicEventType, "VALUE">>;

export const EventColor = {
	PRIMARY: "red",
	SECONDARY: "blue",
} as const;
export type EventColor = Member<typeof EventColor>;
