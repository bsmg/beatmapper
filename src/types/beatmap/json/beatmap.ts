import type { Accept } from "../../utils";
import type { Direction } from "../shared";

export interface Note {
	_time: number;
	_lineIndex: number;
	_lineLayer: number;
	_type: number;
	_cutDirection: Accept<Direction, number>;
}

export interface Obstacle {
	_time: number;
	_duration: number;
	_type: number;
	_lineIndex: number;
	_width: number;
}
