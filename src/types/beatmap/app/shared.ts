import type { Accept, Member } from "../../utils";

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

export const Direction = {
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
export type Direction = Member<typeof Direction>;

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
export type LightingTrackId = Member<Pick<typeof TrackId, 0 | 1 | 2 | 3 | 4>>;
export type RingTrackId = Member<Pick<typeof TrackId, 8 | 9>>;
export type LaserSpeedTrackId = Member<Pick<typeof TrackId, 12 | 13>>;

export const EventType = {
	ON: "on",
	OFF: "off",
	FLASH: "flash",
	FADE: "fade",
	TRIGGER: "rotate",
	VALUE: "change-speed",
} as const;
export type EventType = Accept<Member<typeof EventType>, string>;
export type LightingEventType = Member<Pick<typeof EventType, "ON" | "OFF" | "FLASH" | "FADE">>;
export type RingEventType = Member<Pick<typeof EventType, "TRIGGER">>;
export type LaserSpeedEventType = Member<Pick<typeof EventType, "VALUE">>;

export const EventColorType = {
	PRIMARY: "red",
	SECONDARY: "blue",
} as const;
export type EventColorType = Member<typeof EventColorType>;
