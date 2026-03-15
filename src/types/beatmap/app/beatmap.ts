import type { IWrapBaseNote, IWrapBasicEvent, IWrapBombNote, IWrapColorBoostEvent, IWrapColorNote, IWrapObstacle } from "bsmap";

import type { IWrapEditorObject } from "./shared";

export type IBaseNote = IWrapEditorObject<IWrapBaseNote>;

export type IColorNote = IWrapEditorObject<IWrapColorNote>;
export type IBombNote = IWrapEditorObject<IWrapBombNote>;
export type IObstacle = IWrapEditorObject<IWrapObstacle>;

export type IBasicEvent = IWrapEditorObject<IWrapBasicEvent>;
export type IBoostEvent = IWrapEditorObject<IWrapColorBoostEvent>;

export interface IBookmark {
	time: number;
	name: string;
	color: string;
}

export interface IBeatmapEntities {
	notes: IColorNote[];
	bombs: IBombNote[];
	obstacles: IObstacle[];
	basicEvents: IBasicEvent[];
	boostEvents: IBoostEvent[];
	bookmarks: IBookmark[];
}
