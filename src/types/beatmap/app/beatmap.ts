import type { IEntity } from "../shared";
import type { CutDirection, IEditorObject, ObstacleType, SaberColor } from "./shared";

// NOTE: This type is unused. Planning to migrate to it, but for now I'm using the raw "note" type, with all the underscore-prefixed fields used in-game.
export interface IBaseNote extends IEntity, IEditorObject {
	beatNum: number;
	rowIndex: number;
	colIndex: number;
}

export interface IBaseObstacle extends IEntity, IEditorObject {
	beatNum: number;
	beatDuration: number;
	type: ObstacleType;
	colIndex: number;
	colspan: number;
	fast?: boolean;
}
export interface IExtensionObstacle extends IBaseObstacle {
	type: typeof ObstacleType.EXTENDED;
	rowIndex: number;
	rowspan: number;
}

export type ColorNote = IBaseNote & { color: SaberColor; direction: CutDirection };
export type BombNote = IBaseNote & {};
export type Obstacle = IBaseObstacle | IExtensionObstacle;
