import type { BasicEvent, BombNote, Bookmark, ColorNote, Obstacle } from "./app";

export * from "./shared";

export * as App from "./app";
export * as Json from "./json";

export type { IEditorObject } from "./app/shared";

export interface BeatmapEntities {
	notes: ColorNote[];
	bombs: BombNote[];
	obstacles: Obstacle[];
	events: BasicEvent[];
	bookmarks: Bookmark[];
}
