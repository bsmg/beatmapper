import type { IWrapArc, IWrapBaseNote, IWrapBasicEvent, IWrapBombNote, IWrapChain, IWrapColorBoostEvent, IWrapColorNote, IWrapNJSEvent, IWrapObstacle } from "bsmap";

import type { IWrapEditorObject } from "./shared";

export type IBaseNote = IWrapEditorObject<IWrapBaseNote>;

export type IColorNote = IWrapEditorObject<IWrapColorNote>;
export type IBombNote = IWrapEditorObject<IWrapBombNote>;
export type IObstacle = IWrapEditorObject<IWrapObstacle>;
export type IArc = IWrapEditorObject<IWrapArc>;
export type IChain = IWrapEditorObject<IWrapChain>;

export type IBasicEvent = IWrapEditorObject<IWrapBasicEvent>;
export type IBoostEvent = IWrapEditorObject<IWrapColorBoostEvent>;
export type INJSEvent = IWrapEditorObject<IWrapNJSEvent>;

export interface IBookmark {
	time: number;
	name: string;
	color: string;
}

export interface IBeatmapEntities {
	notes: IColorNote[];
	bombs: IBombNote[];
	obstacles: IObstacle[];
	arcs: IArc[];
	chains: IChain[];
	basicEvents: IBasicEvent[];
	boostEvents: IBoostEvent[];
	njsEvents: INJSEvent[];
	bookmarks: IBookmark[];
}
