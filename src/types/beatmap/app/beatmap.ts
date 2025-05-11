import type { wrapper } from "bsmap/types";
import type { IWrapEditorObject } from "./shared";

export type IBaseNote = IWrapEditorObject<wrapper.IWrapBaseNote>;

export type IColorNote = IWrapEditorObject<wrapper.IWrapColorNote>;
export type IBombNote = IWrapEditorObject<wrapper.IWrapBombNote>;
export type IObstacle = IWrapEditorObject<wrapper.IWrapObstacle>;
