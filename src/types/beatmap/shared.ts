import type { EntityId } from "@reduxjs/toolkit";
import type { Accept, Member } from "../utils";

export type SongId = EntityId;
export type BeatmapId = Accept<Difficulty, EntityId>;

export const Difficulty = {
	EASY: "Easy",
	NORMAL: "Normal",
	HARD: "Hard",
	EXPERT: "Expert",
	EXPERT_PLUS: "ExpertPlus",
} as const;
export type Difficulty = Member<typeof Difficulty>;

export const Environment = {
	THE_FIRST: "DefaultEnvironment",
	ORIGINS: "OriginsEnvironment",
	TRIANGLE: "TriangleEnvironment",
	BIG_MIRROR: "BigMirrorEnvironment",
	NICE: "NiceEnvironment",
	KDA: "KDAEnvironment",
	MONSTERCAT: "MonstercatEnvironment",
	DRAGONS: "DragonsEnvironment",
	CRAB_RAVE: "CrabRaveEnvironment",
	PANIC: "PanicEnvironment",
} as const;
export type Environment = Accept<Member<typeof Environment>, string>;

export const Direction = {
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3,
	UP_LEFT: 4,
	UP_RIGHT: 5,
	DOWN_LEFT: 6,
	DOWN_RIGHT: 7,
	ANY: 8,
} as const;
export type Direction = Accept<Member<typeof Direction>, number>;
