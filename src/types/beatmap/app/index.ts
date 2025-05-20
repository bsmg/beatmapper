import type { IBombNote, IColorNote, IObstacle } from "./beatmap";
import type { IBookmark } from "./editor";
import type { IBasicEvent } from "./lightshow";

export * from "./beatmap";
export * from "./editor";
export * from "./info";
export * from "./lightshow";
export * from "./shared";

export interface BeatmapEntities {
	notes: IColorNote[];
	bombs: IBombNote[];
	obstacles: IObstacle[];
	events: IBasicEvent[];
	bookmarks: IBookmark[];
}
