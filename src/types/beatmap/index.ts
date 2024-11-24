import type { BasicEvent, Bookmark, IEditorObject, Obstacle } from "./app";
import type { Note } from "./json";

export * from "./shared";

export * as App from "./app";
export * as Json from "./json";

export type { IEditorObject } from "./app/shared";

export interface BeatmapEntities {
	notes: (Note & IEditorObject)[];
	obstacles: Obstacle[];
	events: BasicEvent[];
	bookmarks: Bookmark[];
}
