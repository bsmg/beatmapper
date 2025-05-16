import type { GroupProps } from "@react-three/fiber";
import { useCallback, useState } from "react";

import type { ObjectPlacementMode } from "$/types";

import { useGlobalEventListener } from "$/components/hooks";
import { type IPlacementGridContext, Provider } from "./context";
import { resolveNoteDirectionForPlacementMode } from "./helpers";

interface Props extends GroupProps {
	mode: ObjectPlacementMode;
	onCellPointerDown?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt">) => void;
	onCellPointerUp?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt" | "cellOverAt" | "direction">) => void;
	onCellPointerOver?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt" | "cellOverAt">) => void;
	onCellPointerOut?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt" | "cellOverAt">) => void;
	onCellPointerMove?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "cellDownAt" | "cellOverAt" | "hoveredCell" | "direction">) => void;
}
function PlacementGridRoot({ mode, onCellPointerDown, onCellPointerUp, onCellPointerMove, onCellPointerOver, onCellPointerOut, children, ...rest }: Props) {
	const [mouseDownAt, setMouseDownAt] = useState<{ x: number; y: number } | null>(null);
	const [cellDownAt, setCellDownAt] = useState<{ rowIndex: number; colIndex: number } | null>(null);
	const [cellOverAt, setCellOverAt] = useState<{ rowIndex: number; colIndex: number } | null>(null);
	const [cachedDirection, setCachedDirection] = useState<number | null>(null);

	// `hoveredCell` is an indication of which square is currently highlighted by the cursor. You might think I could just use `cellOverAt`, but there are 2 reasons why I can't:
	// - When clicking and dragging to place a cell, I want to 'lock' hoveredCell, even though I'm still mousing over other cells
	// - A weird bug (maybe?) means that mouseOver events can fire BEFORE mouseOut events (on the cell being leaved). So I get buggy flickering if I don't use this derived value.
	const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);

	const handlePointerDown = useCallback(
		(event: PointerEvent, { cellDownAt }: Pick<IPlacementGridContext, "cellDownAt">) => {
			if (!cellDownAt) return;
			// Only pay attention to left-clicks when it comes to the placement grid. Right-clicks should pass through.
			if (event.button !== 0) return;

			setMouseDownAt({ x: event.pageX, y: event.pageY });
			setCellDownAt({ ...cellDownAt });
			if (onCellPointerDown) onCellPointerDown(event, { cellDownAt });
		},
		[onCellPointerDown],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (!cellDownAt) return;
			if (onCellPointerUp) onCellPointerUp(event, { cellDownAt, cellOverAt: cellOverAt, direction: cachedDirection });
			setMouseDownAt(null);
			setCellDownAt(null);
			setCellOverAt(null);
			setHoveredCell(null);
			setCachedDirection(null);
		},
		[cellDownAt, cellOverAt, cachedDirection, onCellPointerUp],
	);

	useGlobalEventListener("pointerup", handlePointerUp, {
		shouldFire: !!cellDownAt,
	});

	const handlePointerOver = useCallback(
		(event: PointerEvent, { cellOverAt }: Pick<IPlacementGridContext, "cellOverAt">) => {
			setCellOverAt(cellOverAt);
			// Don't update 'hoveredCell' if I'm clicking and dragging a block
			if (!cellDownAt) {
				setHoveredCell(cellOverAt);
			}
			if (onCellPointerOver) onCellPointerOver(event, { cellDownAt, cellOverAt });
		},
		[cellDownAt, onCellPointerOver],
	);

	const handlePointerOut = useCallback(
		(event: PointerEvent, { cellOverAt }: Pick<IPlacementGridContext, "cellOverAt">) => {
			// If the user is in the middle of placing a block, ignore this event
			if (cellDownAt) return;
			// A strange quirk/bug can mean that the `pointerOut` event fires AFTER the user has already entered a new cell.
			// Only unset the hovered cell if they haven't already moved onto a new cell.
			if (hoveredCell) {
				setHoveredCell(null);
			}
			if (onCellPointerOut) onCellPointerOut(event, { cellDownAt, cellOverAt });
		},
		[cellDownAt, hoveredCell, onCellPointerOut],
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			if (!mouseDownAt) return;

			const mouseOverAt = { x: event.pageX, y: event.pageY };
			const direction = resolveNoteDirectionForPlacementMode(mouseDownAt, mouseOverAt, {
				mappingMode: mode,
				precisionPlacement: event.ctrlKey || event.metaKey,
			});
			// Mousemoves register very quickly; dozens of identical events might be submitted if we don't stop it, causing a backlog to accumulate on the main thread.
			if (direction === null || direction === cachedDirection) return;
			setCachedDirection(direction);

			if (onCellPointerMove) onCellPointerMove(event, { cellDownAt, cellOverAt: cellOverAt, hoveredCell, direction: cachedDirection });
		},
		[mode, mouseDownAt, cellDownAt, cellOverAt, hoveredCell, cachedDirection, onCellPointerMove],
	);

	useGlobalEventListener("pointermove", handlePointerMove, {
		shouldFire: !!cellDownAt,
	});

	return (
		<Provider value={{ cellDownAt, cellOverAt: cellOverAt, hoveredCell, direction: cachedDirection, onCellPointerDown: handlePointerDown, onCellPointerOver: handlePointerOver, onCellPointerOut: handlePointerOut }}>
			<group {...rest}>{children}</group>
		</Provider>
	);
}

export default PlacementGridRoot;
