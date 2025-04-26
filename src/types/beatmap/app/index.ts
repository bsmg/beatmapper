import type { BombNote, ColorNote, Obstacle } from "./beatmap";
import type { Bookmark } from "./editor";
import type { BasicEvent } from "./lightshow";

export * from "./beatmap";
export * from "./editor";
export * from "./info";
export * from "./lightshow";
export * from "./shared";

export interface BeatmapEntities {
	notes: ColorNote[];
	bombs: BombNote[];
	obstacles: Obstacle[];
	events: BasicEvent[];
	bookmarks: Bookmark[];
}
