import type { wrapper } from "bsmap/types";

import type { IWrapEditorObject } from "./shared";

export type IBaseNote = IWrapEditorObject<wrapper.IWrapBaseNote>;

export type IColorNote = IWrapEditorObject<wrapper.IWrapColorNote>;
export type IBombNote = IWrapEditorObject<wrapper.IWrapBombNote>;
export type IObstacle = IWrapEditorObject<wrapper.IWrapObstacle>;

export type IBasicEvent = IWrapEditorObject<wrapper.IWrapBasicEvent>;

export interface IBookmark {
	time: number;
	name: string;
	color: string;
}

export interface IBeatmapEntities {
	notes: IColorNote[];
	bombs: IBombNote[];
	obstacles: IObstacle[];
	events: IBasicEvent[];
	bookmarks: IBookmark[];
}
