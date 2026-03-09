import type { ThreeEvent } from "@react-three/fiber";
import { createMachine, type MachineSchema, type Service } from "@zag-js/core";

import type { IGrid, IGridCell, NotePlacementMode, ObstaclePlacementMode } from "$/types";
import type { ThreeProps } from "$/types/vendor";
import { isMetaKeyPressed } from "$/utils";
import { BLOCK_CELL_SIZE } from "../../constants";
import { resolveNoteDirectionForPlacementMode } from "./helpers";

export interface IPlacementContext {
	cellDownAt: IGridCell | null;
	cellOverAt: IGridCell | null;
	direction: number | null;
}

export interface PlacementGridSchema extends MachineSchema {
	props: {
		notePlacementMode: NotePlacementMode;
		obstaclePlacementMode: ObstaclePlacementMode;
		grid: IGrid;
		onPointerUp?: (event: PointerEvent, payload: Pick<IPlacementContext, "cellDownAt" | "cellOverAt" | "direction">) => void;
		onCellPointerDown?: (event: ThreeEvent<PointerEvent>, payload: Pick<IPlacementContext, "cellDownAt">) => void;
		onCellWheel?: (event: ThreeEvent<WheelEvent>, payload: Pick<IPlacementContext, "cellOverAt">) => void;
	};
	refs: {
		mouseDownAt: { x: number; y: number; button: number } | null;
	};
	context: IPlacementContext & {
		hoveredCell: IGridCell | null;
	};
}

export const machine = createMachine<PlacementGridSchema>({
	initialState: () => "idle",
	refs: () => {
		return {
			mouseDownAt: null,
		};
	},
	context: ({ bindable }) => {
		return {
			cellDownAt: bindable<IGridCell | null>(() => ({ defaultValue: null })),
			cellOverAt: bindable<IGridCell | null>(() => ({ defaultValue: null })),
			direction: bindable<number | null>(() => ({ defaultValue: null })),
			hoveredCell: bindable<IGridCell | null>(() => ({ defaultValue: null })),
		};
	},
	states: {},
});

export function connect({ prop, context, refs }: Service<PlacementGridSchema>) {
	const notePlacementMode = prop("notePlacementMode");
	const obstaclePlacementMode = prop("obstaclePlacementMode");
	const grid = prop("grid");
	const mouseDownAt = refs.get("mouseDownAt");

	const scaleIndex = (value: number) => value * BLOCK_CELL_SIZE;

	return {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		mouseDownAt,
		cellDownAt: context.get("cellDownAt"),
		cellOverAt: context.get("cellOverAt"),
		direction: context.get("direction"),

		getCellProps: ({ colIndex, rowIndex }: IGridCell): ThreeProps<"group"> => {
			const currentCell = { colIndex, rowIndex };

			const x = scaleIndex((grid.numCols * -0.5 + 0.5 + colIndex) * grid.colWidth);
			const y = scaleIndex(rowIndex * grid.rowHeight - 1);

			return {
				"position-x": x,
				"position-y": y,
				onPointerDown: (event) => {
					refs.set("mouseDownAt", { x: event.pageX, y: event.pageY, button: event.button });
					context.set("cellDownAt", currentCell);

					if (event.button === 0) {
						prop("onCellPointerDown")?.(event, { cellDownAt: currentCell });
					}
				},
				onPointerMove: () => {
					if (mouseDownAt) return;

					if (context.get("hoveredCell") !== currentCell) {
						context.set("hoveredCell", currentCell);
					}
				},
				onPointerOver: () => {
					context.set("cellOverAt", currentCell);

					if (!context.get("cellDownAt")) {
						context.set("hoveredCell", currentCell);
					}
				},
				onPointerOut: () => {
					if (!context.get("cellDownAt")) {
						context.set("hoveredCell", null);
					}
				},
			};
		},

		createGlobalHandlers: () => {
			return {
				onPointerMove: (event: PointerEvent) => {
					if (!mouseDownAt) return;

					const currentDir = resolveNoteDirectionForPlacementMode(
						mouseDownAt,
						{ x: event.pageX, y: event.pageY },
						{
							mode: notePlacementMode,
							usePrecisionPlacement: isMetaKeyPressed(event),
						},
					);

					if (currentDir !== context.get("direction")) {
						context.set("direction", currentDir);
					}
				},
				onPointerUp: (event: PointerEvent) => {
					if (!mouseDownAt) return;

					if (event.button === 0) {
						prop("onPointerUp")?.(event, {
							cellDownAt: context.get("cellDownAt"),
							cellOverAt: context.get("cellOverAt"),
							direction: context.get("direction"),
						});
					}
					refs.set("mouseDownAt", null);

					context.set("cellDownAt", null);
					context.set("direction", null);
				},
			};
		},
		isCellHovered: ({ colIndex, rowIndex }: IGridCell) => {
			const hoveredCell = context.get("hoveredCell");
			return !!(hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.colIndex === colIndex);
		},
		scaleIndex: scaleIndex,
	};
}
