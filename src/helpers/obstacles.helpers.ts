import { v1, v2, v3, v4 } from "bsmap";
import type { container, v1 as v1t, v2 as v2t, v3 as v3t } from "bsmap/types";

import { App, ObjectPlacementMode } from "$/types";
import { clamp, normalize, roundToNearest } from "$/utils";
import { object } from "valibot";
import { convertGridColumn, convertGridRow } from "./grid.helpers";
import { type BeatmapEntitySerializationOptions, MAPPING_EXTENSIONS_DIMENSION_RESOLVERS, MAPPING_EXTENSIONS_INDEX_RESOLVERS, createCoordinateSerializationFactory } from "./object.helpers";
import { createPropertySerializationFactory, createSerializationFactory } from "./serialization.helpers";

export function resolveObstacleId(x: Pick<App.Obstacle, "beatNum" | "colIndex" | "type">) {
	return `${x.beatNum}-${x.colIndex}-${Object.values(App.ObstacleType).indexOf(x.type)}`;
}

export function isVanillaObstacle(obstacle: App.Obstacle): obstacle is App.IBaseObstacle {
	return obstacle.type !== App.ObstacleType.EXTENDED;
}
export function isExtendedObstacle(obstacle: App.Obstacle): obstacle is App.IExtensionObstacle {
	return obstacle.type === App.ObstacleType.EXTENDED;
}

const FULL_WALL_HEIGHT_IN_ROWS = 5;

const { serialize: serializeColumn, deserialize: deserializeColumn } = createCoordinateSerializationFactory({ min: undefined, max: undefined, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_INDEX_RESOLVERS } });
const { serialize: serializeRow, deserialize: deserializeRow } = createCoordinateSerializationFactory({ min: 0, max: 2, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_INDEX_RESOLVERS } });
const { serialize: serializeWidth, deserialize: deserializeWidth } = createCoordinateSerializationFactory({ min: undefined, max: undefined, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_DIMENSION_RESOLVERS } });
const { serialize: serializeHeight, deserialize: deserializeHeight } = createCoordinateSerializationFactory({ min: 0, max: FULL_WALL_HEIGHT_IN_ROWS, extensions: { "mapping-extensions": MAPPING_EXTENSIONS_DIMENSION_RESOLVERS } });

const { serialize: serializeExtendedType, deserialize: deserializeExtendedType } = createPropertySerializationFactory<{ rowIndex: number; height: number }, number>(() => {
	// These constants relate to the conversion to/from MappingExtensions obstacles.
	const EXTENSIONS_CONSTANT = 4001;
	const WALL_HEIGHT_MIN = 0;
	const WALL_HEIGHT_MAX = 1000;
	const WALL_START_BASE = 100;
	const WALL_START_MAX = 400;

	return {
		container: {
			serialize: ({ rowIndex, height }) => {
				// `wallHeight` is a value from 0 to 4000:
				// - 0 is flat
				// - 1000 is normal height (which I think is like 4 rows?)
				// - 4000 is max
				let normalizedWallHeight = Math.round(normalize(height, 0, FULL_WALL_HEIGHT_IN_ROWS, WALL_HEIGHT_MIN, WALL_HEIGHT_MAX));
				normalizedWallHeight = clamp(normalizedWallHeight, 0, 4000);
				let normalizedWallStart = Math.round(normalize(rowIndex, 0, 2, WALL_START_BASE, WALL_START_MAX));
				normalizedWallStart = clamp(normalizedWallStart, 0, 999);
				const type = normalizedWallHeight * 1000 + normalizedWallStart + EXTENSIONS_CONSTANT;
				return type;
			},
			deserialize: (type) => {
				const typeValue = type - EXTENSIONS_CONSTANT;
				const wallHeight = Math.round(typeValue / 1000);
				const wallStartHeight = typeValue % 1000;
				const rowspan = roundToNearest(normalize(wallHeight, WALL_HEIGHT_MIN, WALL_HEIGHT_MAX, 0, FULL_WALL_HEIGHT_IN_ROWS), 0.001);
				const rowIndex = roundToNearest(normalize(wallStartHeight, WALL_START_BASE, WALL_START_MAX, 0, 2), 0.01);
				return { rowIndex: rowIndex, height: rowspan };
			},
		},
	};
});

type SharedOptions = [BeatmapEntitySerializationOptions<"mapping-extensions">, {}, {}, {}, {}];

export const { serialize: serializeObstacle, deserialize: deserializeObstacle } = createSerializationFactory<App.Obstacle, [v1t.IObstacle, v2t.IObstacle, v3t.IObstacle, container.v4.IObstacleContainer], SharedOptions, SharedOptions>("Obstacle", () => {
	return {
		1: {
			schema: v1.ObstacleSchema,
			container: {
				serialize: (data) => {
					const posX = serializeColumn(data.colIndex, {});
					const width = serializeWidth(data.colspan, {});
					const type = isExtendedObstacle(data) ? serializeExtendedType({ rowIndex: data.rowIndex, height: data.rowspan }, {}) : Object.values(App.ObstacleType).indexOf(data.type);
					return {
						_type: type,
						_time: data.beatNum,
						_duration: data.beatDuration * (data.fast ? -1 : 1),
						_lineIndex: posX,
						_width: width,
					};
				},
				deserialize: (data) => {
					const fromType = data._type && data._type > 2 ? deserializeExtendedType(data._type, {}) : undefined;
					const type = data._type && data._type > 2 ? App.ObstacleType.EXTENDED : Object.values(App.ObstacleType)[data._type ?? 0];
					const posX = deserializeColumn(data._lineIndex ?? 0, {});
					const width = deserializeWidth(data._width ?? 0, {});
					const fast = data._duration && data._duration < 0 ? true : undefined;
					return {
						id: resolveObstacleId({ beatNum: data._time ?? 0, colIndex: posX, type: type }),
						type: type,
						beatNum: data._time ?? 0,
						beatDuration: data._duration ?? 0,
						colIndex: posX,
						rowIndex: fromType?.rowIndex,
						colspan: width,
						rowspan: fromType?.height,
						fast,
					} as App.Obstacle;
				},
			},
		},
		2: {
			schema: v2.ObstacleSchema,
			container: {
				serialize: (data, options) => {
					const posX = serializeColumn(data.colIndex, options);
					const width = serializeWidth(data.colspan, options);
					const type = isExtendedObstacle(data) ? serializeExtendedType({ rowIndex: data.rowIndex, height: data.rowspan }, {}) : Object.values(App.ObstacleType).indexOf(data.type);
					return {
						_type: type,
						_time: data.beatNum,
						_duration: data.beatDuration * (data.fast ? -1 : 1),
						_lineIndex: posX,
						_width: width,
					};
				},
				deserialize: (data, options) => {
					const fromType = data._type && data._type > 2 ? deserializeExtendedType(data._type, options) : undefined;
					const type = data._type && data._type > 2 ? App.ObstacleType.EXTENDED : Object.values(App.ObstacleType)[data._type ?? 0];
					const posX = deserializeColumn(data._lineIndex ?? 0, options);
					const width = deserializeWidth(data._width ?? 0, options);
					const fast = data._duration && data._duration < 0 ? true : undefined;
					return {
						id: resolveObstacleId({ beatNum: data._time ?? 0, colIndex: posX, type: type }),
						type: type,
						beatNum: data._time ?? 0,
						beatDuration: Math.abs(data._duration ?? 0),
						colIndex: posX,
						rowIndex: fromType?.rowIndex,
						colspan: width,
						rowspan: fromType?.height,
						fast,
					} as App.Obstacle;
				},
			},
		},
		3: {
			schema: v3.ObstacleSchema,
			container: {
				serialize: (data, options) => {
					const posX = serializeColumn(data.colIndex, options);
					const posY = serializeRow(isExtendedObstacle(data) ? data.rowIndex : data.type === App.ObstacleType.FULL ? 0 : 2, options);
					const width = serializeWidth(data.colspan, options);
					const height = serializeHeight(isExtendedObstacle(data) ? data.rowspan : data.type === App.ObstacleType.FULL ? 5 : 3, options);
					return {
						b: data.beatNum,
						d: data.beatDuration * (data.fast ? -1 : 1),
						x: posX,
						y: posY,
						w: width,
						h: height,
					};
				},
				deserialize: (data, options) => {
					const type = data.y === 0 && data.h === 5 ? App.ObstacleType.FULL : data.y === 2 && data.h === 3 ? App.ObstacleType.TOP : App.ObstacleType.EXTENDED;
					const posX = deserializeColumn(data.x ?? 0, options);
					const posY = deserializeRow(data.y ?? 0, options);
					const width = deserializeWidth(data.w ?? 0, options);
					const height = deserializeHeight(data.h ?? 0, options);
					const fast = data.d && data.d < 0 ? true : undefined;
					return {
						id: resolveObstacleId({ beatNum: data.b ?? 0, colIndex: posX, type: type }),
						type: type,
						beatNum: data.b ?? 0,
						beatDuration: data.d ?? 0,
						colIndex: posX,
						rowIndex: type === App.ObstacleType.EXTENDED ? posY : undefined,
						colspan: width,
						rowspan: type === App.ObstacleType.EXTENDED ? height : undefined,
						fast,
					} as App.Obstacle;
				},
			},
		},
		4: {
			schema: object({ object: v4.ObjectLaneSchema, data: v4.ObstacleSchema }),
			container: {
				serialize: (data) => {
					const posX = serializeColumn(data.colIndex, {});
					const posY = serializeRow(isExtendedObstacle(data) ? data.rowIndex : data.type === App.ObstacleType.FULL ? 0 : 2, {});
					const width = serializeWidth(data.colspan, {});
					const height = serializeHeight(isExtendedObstacle(data) ? data.rowspan : data.type === App.ObstacleType.FULL ? 5 : 3, {});
					return {
						object: {
							b: data.beatNum,
						},
						data: {
							d: data.beatDuration * (data.fast ? -1 : 1),
							x: posX,
							y: posY,
							w: width,
							h: height,
						},
					};
				},
				deserialize: (data) => {
					const type = data.data.y === 0 && data.data.h === 5 ? App.ObstacleType.FULL : data.data.y === 2 && data.data.h === 3 ? App.ObstacleType.TOP : App.ObstacleType.EXTENDED;
					const posX = deserializeColumn(data.data.x ?? 0, {});
					const posY = deserializeRow(data.data.y ?? 0, {});
					const width = deserializeWidth(data.data.w ?? 0, {});
					const height = deserializeHeight(data.data.h ?? 0, {});
					const fast = data.data.d && data.data.d < 0 ? true : undefined;
					return {
						id: resolveObstacleId({ beatNum: data.object.b ?? 0, colIndex: posX, type: type }),
						type: type,
						beatNum: data.object.b ?? 0,
						beatDuration: data.data.d ?? 0,
						colIndex: posX,
						rowIndex: type === App.ObstacleType.EXTENDED ? posY : undefined,
						colspan: width,
						rowspan: type === App.ObstacleType.EXTENDED ? height : undefined,
						fast,
					} as App.Obstacle;
				},
			},
		},
	};
});

export function createObstacleFromMouseEvent(mode: ObjectPlacementMode, numCols: number, numRows: number, colWidth: number, rowHeight: number, mouseDownAt: { colIndex: number; rowIndex: number } | null, mouseOverAt: { colIndex: number; rowIndex: number } | null, beatDuration = 4) {
	if (!mouseDownAt || !mouseOverAt) throw new Error("Unable to create valid obstacle.");
	const laneIndex = Math.min(mouseDownAt.colIndex, mouseOverAt.colIndex);

	// Our colIndex will be a value from 0 to N-1, where N is the num of columns. Eg in an 8-column grid, the number is 0-7.
	// The thing is, I want to store lanes as relative to a 4-column "natural" grid,
	// so column 0 of an 8-column grid should actually be -2 (with a full range of -2 to 5, with 2 before and 2 after the standard 0-3 range).
	const colspan = Math.abs(mouseDownAt.colIndex - mouseOverAt.colIndex) + 1;

	const obstacleType = mode === ObjectPlacementMode.EXTENSIONS ? App.ObstacleType.EXTENDED : mouseOverAt.rowIndex === 2 ? App.ObstacleType.TOP : App.ObstacleType.FULL;

	const obstacle = {
		type: obstacleType,
		beatDuration,
		colspan,
	} as App.Obstacle;

	// 'original' walls need to be clamped, to not cause hazards
	if (mode === ObjectPlacementMode.NORMAL) {
		const lane = convertGridColumn(laneIndex, numCols, colWidth);
		obstacle.colIndex = lane;

		if (obstacle.type === App.ObstacleType.FULL && obstacle.colspan > 2) {
			const overBy = obstacle.colspan - 2;
			obstacle.colspan = 2;

			const colspanDelta = mouseOverAt.colIndex - mouseDownAt.colIndex;

			if (colspanDelta > 0) {
				obstacle.colIndex += overBy;
			} else {
				obstacle.colIndex = mouseOverAt.colIndex;
			}
		}
	} else if (mode === ObjectPlacementMode.EXTENSIONS) {
		if (!isExtendedObstacle(obstacle)) return obstacle;
		// For mapping extensions, things work a little bit differently.
		// We need a rowIndex, which works like `lane`, and rowspan, which works like `colspan`
		const rawRowIndex = Math.min(mouseDownAt.rowIndex, mouseOverAt.rowIndex);

		let lane = convertGridColumn(laneIndex, numCols, colWidth);
		let rowIndex = convertGridRow(rawRowIndex, numRows, rowHeight);

		// For completely mystifying reasons, the lanes for obstacles don't scale well with non-standard size cells.
		// I graphed the amount it was off by so that I could use it. No friggin clue why this works but it does.
		const shiftLaneBy = 0.5 * colWidth - 0.5;
		lane -= shiftLaneBy;

		const shiftRowBy = 0.5 * rowHeight - 0.5;
		rowIndex -= shiftRowBy;

		const rowspan = Math.abs(mouseDownAt.rowIndex - mouseOverAt.rowIndex) + 1;

		// while `rowspan` should technically be the number of rows the thing spans, this data is insufficient with Mapping Extensions,
		// where the user can change the height of rows so that an obstacle takes up 1 row but 2 "normal" rows.
		obstacle.rowspan = rowspan * rowHeight;
		// Same thing for columns
		obstacle.colspan = colspan * colWidth;

		obstacle.colIndex = lane;
		obstacle.rowIndex = rowIndex;
	}

	return obstacle;
}
