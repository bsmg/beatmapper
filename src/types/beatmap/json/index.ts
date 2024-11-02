import type { Note, Obstacle } from "./beatmap";
import type { Bookmark } from "./editor";
import type { Event } from "./lightshow";

export * from "./beatmap";
export * from "./editor";
export * from "./info";
export * from "./lightshow";

interface CustomBeatmapData {
	_bookmarks: Bookmark[];
}

export interface Beatmap {
	_notes: Note[];
	_obstacles: Obstacle[];
	_events: Event[];
	_customData?: Partial<CustomBeatmapData>;
}
