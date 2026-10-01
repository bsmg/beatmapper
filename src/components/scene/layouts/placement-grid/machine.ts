import type { ThreeEvent } from "@react-three/fiber";
import { createMachine, type MachineSchema, type Service } from "@zag-js/core";

import { BLOCK_CELL_SIZE } from "$/components/scene/constants";
import { type IGrid, type IGridCell, NotePlacementMode, type ObstaclePlacementMode } from "$/types";
import type { ThreeProps } from "$/types/vendor";
import { isModKeyPressed } from "$/utils";
import { resolveNoteDirectionForPlacementMode } from "./direction.helpers";

export interface IPlacementContext {
	cellDownAt: IGridCell | null;
	cellOverAt: IGridCell | null;
	direction: number | null;
	time: number | null;
	duration: number | null;
}

export interface PlacementGridSchema extends MachineSchema {
	props: {
		notePlacementMode: NotePlacementMode;
		obstaclePlacementMode: ObstaclePlacementMode;
		grid: IGrid;
		cursorPositionInBeats: number;
		shouldLockCursor: boolean;
		onPointerUp?: (event: PointerEvent, payload: Pick<IPlacementContext, "cellDownAt" | "cellOverAt" | "direction" | "time" | "duration">) => void;
		onCellPointerDown?: (event: ThreeEvent<PointerEvent>, payload: Pick<IPlacementContext, "cellDownAt" | "time" | "duration">) => void;
		onCellWheel?: (event: ThreeEvent<WheelEvent>, payload: Pick<IPlacementContext, "cellOverAt">) => void;
	};
	refs: {
		mouseDownAt: { x: number; y: number; button: number } | null;
		anchorBeat: number | null;
	};
	context: IPlacementContext & {
		hoveredCell: IGridCell | null;
	};
	event:
		| { type: "POINTER_DOWN"; event: ThreeEvent<PointerEvent>; currentCell: IGridCell }
		| { type: "POINTER_MOVE"; event: PointerEvent | ThreeEvent<PointerEvent>; currentCell?: IGridCell }
		| { type: "POINTER_OVER"; currentCell: IGridCell }
		| { type: "POINTER_OUT"; currentCell: IGridCell }
		| { type: "POINTER_UP"; event: PointerEvent };
	guard: "isLeftClick";
	action: "handlePointerDown" | "handlePointerUp" | "handlePointerMoveIdle" | "handlePointerMoveDragging" | "handlePointerOver" | "handlePointerOut";
}

export const machine = createMachine<PlacementGridSchema>({
	initialState: () => "idle",
	refs: () => ({
		mouseDownAt: null,
		anchorBeat: null,
	}),
	context: ({ bindable }) => ({
		cellDownAt: bindable<IGridCell | null>(() => ({ defaultValue: null })),
		cellOverAt: bindable<IGridCell | null>(() => ({ defaultValue: null })),
		direction: bindable<number | null>(() => ({ defaultValue: null })),
		time: bindable<number | null>(() => ({ defaultValue: null })),
		duration: bindable<number | null>(() => ({ defaultValue: null })),
		hoveredCell: bindable<IGridCell | null>(() => ({ defaultValue: null })),
	}),
	states: {
		idle: {
			on: {
				POINTER_DOWN: {
					target: "dragging",
					guard: "isLeftClick",
					actions: ["handlePointerDown"],
				},
				POINTER_OVER: {
					actions: ["handlePointerOver"],
				},
				POINTER_OUT: {
					actions: ["handlePointerOut"],
				},
				POINTER_MOVE: {
					actions: ["handlePointerMoveIdle"],
				},
			},
		},
		dragging: {
			on: {
				POINTER_UP: {
					target: "idle",
					actions: ["handlePointerUp"],
				},
				POINTER_OVER: {
					actions: ["handlePointerOver"],
				},
				POINTER_OUT: {
					actions: ["handlePointerOut"],
				},
				POINTER_MOVE: {
					actions: ["handlePointerMoveDragging"],
				},
			},
		},
	},
	implementations: {
		guards: {
			isLeftClick: ({ event }) => event.event.button === 0,
		},
		actions: {
			handlePointerDown: ({ context, refs, prop, event }) => {
				const { event: pointerEvent, currentCell } = event;
				refs.set("mouseDownAt", { x: pointerEvent.pageX, y: pointerEvent.pageY, button: pointerEvent.button });
				context.set("cellDownAt", currentCell);

				const currentBeat = prop("cursorPositionInBeats");
				refs.set("anchorBeat", currentBeat);
				context.set("time", currentBeat);
				context.set("duration", null);

				prop("onCellPointerDown")?.(pointerEvent, {
					cellDownAt: currentCell,
					time: context.get("time"),
					duration: context.get("duration"),
				});
			},
			handlePointerOver: ({ context, event }) => {
				context.set("cellOverAt", event.currentCell);
				if (!context.get("cellDownAt")) {
					context.set("hoveredCell", event.currentCell);
				}
			},
			handlePointerOut: ({ context }) => {
				if (!context.get("cellDownAt")) {
					context.set("hoveredCell", null);
				}
			},
			handlePointerMoveIdle: ({ context, event }) => {
				if (event.currentCell && context.get("hoveredCell") !== event.currentCell) {
					context.set("hoveredCell", event.currentCell);
				}
			},
			handlePointerMoveDragging: ({ context, refs, prop, event }) => {
				const pointerEvent = event.event;
				const anchorBeat = refs.get("anchorBeat");
				const shouldLockCursor = prop("shouldLockCursor");

				if (anchorBeat !== null) {
					if (!shouldLockCursor) {
						const currentBeat = prop("cursorPositionInBeats");
						context.set("time", Math.min(anchorBeat, currentBeat));
						context.set("duration", Math.abs(currentBeat - anchorBeat));
					} else {
						context.set("time", anchorBeat);
						context.set("duration", null);
					}
				}

				const currentMouseDownAt = refs.get("mouseDownAt");
				if (!currentMouseDownAt) return;

				const notePlacementMode = prop("notePlacementMode");
				const usePrecisionPlacement = notePlacementMode === NotePlacementMode.EXTENSIONS && isModKeyPressed(pointerEvent as PointerEvent);
				const currentDir = resolveNoteDirectionForPlacementMode(currentMouseDownAt, { x: (pointerEvent as PointerEvent).pageX, y: (pointerEvent as PointerEvent).pageY }, { usePrecisionPlacement });

				if (currentDir !== context.get("direction")) {
					context.set("direction", currentDir);
				}
			},
			handlePointerUp: ({ context, refs, prop, event }) => {
				const pointerEvent = event.event;
				const anchorBeat = refs.get("anchorBeat");
				const shouldLockCursor = prop("shouldLockCursor");

				if (anchorBeat !== null) {
					if (!shouldLockCursor) {
						const currentBeat = prop("cursorPositionInBeats");
						context.set("time", Math.min(anchorBeat, currentBeat));
						context.set("duration", Math.abs(currentBeat - anchorBeat));
					} else {
						context.set("time", anchorBeat);
						context.set("duration", null);
					}
				}

				const currentMouseDownAt = refs.get("mouseDownAt");
				if (currentMouseDownAt) {
					prop("onPointerUp")?.(pointerEvent, {
						cellDownAt: context.get("cellDownAt"),
						cellOverAt: context.get("cellOverAt"),
						direction: context.get("direction"),
						duration: context.get("duration"),
						time: context.get("time"),
					});
				}

				refs.set("mouseDownAt", null);
				refs.set("anchorBeat", null);
				context.set("cellDownAt", null);
				context.set("direction", null);
				context.set("duration", null);
				context.set("time", null);
			},
		},
	},
});

export function connect({ prop, context, refs, send }: Service<PlacementGridSchema>) {
	const notePlacementMode = prop("notePlacementMode");
	const obstaclePlacementMode = prop("obstaclePlacementMode");
	const grid = prop("grid");

	const scaleIndex = (value: number) => value * BLOCK_CELL_SIZE;

	return {
		notePlacementMode,
		obstaclePlacementMode,
		grid,
		get mouseDownAt() {
			return refs.get("mouseDownAt");
		},
		get anchorBeat() {
			return refs.get("anchorBeat");
		},
		cellDownAt: context.get("cellDownAt"),
		cellOverAt: context.get("cellOverAt"),
		direction: context.get("direction"),
		time: context.get("time"),
		duration: context.get("duration"),
		scaleIndex: scaleIndex,

		updateAnchoredValues: () => {
			const anchorBeat = refs.get("anchorBeat");
			if (anchorBeat === null) return;

			if (!prop("shouldLockCursor")) {
				const currentBeat = prop("cursorPositionInBeats");
				context.set("time", Math.min(anchorBeat, currentBeat));
				context.set("duration", Math.abs(currentBeat - anchorBeat));
			} else {
				context.set("time", anchorBeat);
				context.set("duration", null);
			}
		},
		getCellProps: ({ colIndex, rowIndex }: IGridCell): ThreeProps<"group"> => {
			const currentCell = { colIndex, rowIndex };

			const x = scaleIndex((grid.numCols * -0.5 + 0.5 + colIndex + grid.colOffset) * grid.colWidth);
			const y = scaleIndex(rowIndex * grid.rowHeight - 1 + grid.rowOffset);

			return {
				"position-x": x,
				"position-y": y,
				onPointerDown: (event) => {
					if (document.pointerLockElement) return;
					send({ type: "POINTER_DOWN", event, currentCell });
				},
				onPointerMove: (event) => {
					if (document.pointerLockElement) {
						context.set("hoveredCell", null);
						return;
					}
					send({ type: "POINTER_MOVE", event, currentCell });
				},
				onPointerOver: () => {
					if (document.pointerLockElement) {
						context.set("hoveredCell", null);
						return;
					}
					send({ type: "POINTER_OVER", currentCell });
				},
				onPointerOut: () => {
					if (document.pointerLockElement) {
						context.set("hoveredCell", null);
						return;
					}
					send({ type: "POINTER_OUT", currentCell });
				},
			};
		},
		createGlobalHandlers: () => {
			return {
				onPointerMove: (event: PointerEvent) => {
					if (document.pointerLockElement) return;
					send({ type: "POINTER_MOVE", event });
				},
				onPointerUp: (event: PointerEvent) => {
					send({ type: "POINTER_UP", event });
				},
			};
		},
		isCellHovered: ({ colIndex, rowIndex }: IGridCell) => {
			const hoveredCell = context.get("hoveredCell");
			return !!(hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.colIndex === colIndex);
		},
	};
}
