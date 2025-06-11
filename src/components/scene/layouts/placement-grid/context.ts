import { createContext } from "react";

export interface IPlacementGridContext {
	cellDownAt: { rowIndex: number; colIndex: number } | null;
	cellOverAt: { rowIndex: number; colIndex: number } | null;
	hoveredCell: { rowIndex: number; colIndex: number } | null;
	direction: number | null;
	onCellPointerDown?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt">) => void;
	onCellPointerOver?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt" | "cellOverAt">) => void;
	onCellPointerOut?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellOverAt">) => void;
}

export const Context = createContext<IPlacementGridContext>({ cellDownAt: null, cellOverAt: null, hoveredCell: null, direction: null });

export const Provider = Context.Provider;
export const Consumer = Context.Consumer;
