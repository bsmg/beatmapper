import { createContext } from "react";

export interface IPlacementGridContext {
	mouseDownAt: { rowIndex: number; colIndex: number; x: number; y: number } | null;
	mouseOverAt: { rowIndex: number; colIndex: number } | null;
	hoveredCell: { rowIndex: number; colIndex: number } | null;
	onCellPointerDown?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt">) => void;
	onCellPointerOver?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => void;
	onCellPointerOut?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseOverAt">) => void;
}

export const Context = createContext<IPlacementGridContext>({ mouseDownAt: null, mouseOverAt: null, hoveredCell: null });

export const Provider = Context.Provider;
export const Consumer = Context.Consumer;
