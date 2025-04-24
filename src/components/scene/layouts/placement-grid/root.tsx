import type { ThreeElements } from "@react-three/fiber";
import { useCallback, useState } from "react";

import type { IGrid } from "$/types";

import { useGlobalEventListener } from "$/components/hooks";
import { type IPlacementGridContext, Provider } from "./context";

type GroupProps = ThreeElements["group"];

interface Props extends IGrid, GroupProps {
	onCellPointerDown?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt">) => void;
	onCellPointerUp?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => void;
	onCellPointerOver?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => void;
	onCellPointerOut?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt" | "mouseOverAt">) => void;
	onCellPointerMove?: (event: PointerEvent, payload: Pick<IPlacementGridContext, "mouseDownAt" | "mouseOverAt" | "hoveredCell">) => void;
}
function PlacementGridRoot({ numRows, numCols, colWidth, rowHeight, onCellPointerDown, onCellPointerUp, onCellPointerMove, onCellPointerOver, onCellPointerOut, children, ...rest }: Props) {
	const [mouseDownAt, setMouseDownAt] = useState<{ rowIndex: number; colIndex: number; x: number; y: number } | null>(null);
	const [mouseOverAt, setMouseOverAt] = useState<{ rowIndex: number; colIndex: number } | null>(null);

	// `hoveredCell` is an indication of which square is currently highlighted by the cursor. You might think I could just use `mouseOverAt`, but there are 2 reasons why I can't:
	// - When clicking and dragging to place a cell, I want to 'lock' hoveredCell, even though I'm still mousing over other cells
	// - A weird bug (maybe?) means that mouseOver events can fire BEFORE mouseOut events (on the cell being leaved). So I get buggy flickering if I don't use this derived value.
	const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);

	const handlePointerDown = useCallback(
		(event: PointerEvent, { mouseDownAt }: Pick<IPlacementGridContext, "mouseDownAt">) => {
			if (!mouseDownAt) return;
			setMouseDownAt({ ...mouseDownAt, x: event.pageX, y: event.pageY });
			if (onCellPointerDown) onCellPointerDown(event, { mouseDownAt });
		},
		[onCellPointerDown],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (!mouseDownAt) return;
			if (onCellPointerUp) onCellPointerUp(event, { mouseDownAt, mouseOverAt });
			setMouseDownAt(null);
			setMouseOverAt(null);
			setHoveredCell(null);
		},
		[mouseDownAt, mouseOverAt, onCellPointerUp],
	);

	useGlobalEventListener("pointerup", handlePointerUp, {
		shouldFire: !!mouseDownAt,
	});

	const handlePointerOver = useCallback(
		(event: PointerEvent, { mouseOverAt }: Pick<IPlacementGridContext, "mouseOverAt">) => {
			setMouseOverAt(mouseOverAt);
			// Don't update 'hoveredCell' if I'm clicking and dragging a block
			if (!mouseDownAt) {
				setHoveredCell(mouseOverAt);
			}
			if (onCellPointerOver) onCellPointerOver(event, { mouseDownAt, mouseOverAt });
		},
		[mouseDownAt, onCellPointerOver],
	);

	const handlePointerOut = useCallback(
		(event: PointerEvent, { mouseOverAt }: Pick<IPlacementGridContext, "mouseOverAt">) => {
			// If the user is in the middle of placing a block, ignore this event
			if (mouseDownAt) return;
			// A strange quirk/bug can mean that the `pointerOut` event fires AFTER the user has already entered a new cell.
			// Only unset the hovered cell if they haven't already moved onto a new cell.
			if (hoveredCell) {
				setHoveredCell(null);
			}
			if (onCellPointerOut) onCellPointerOut(event, { mouseDownAt, mouseOverAt });
		},
		[mouseDownAt, hoveredCell, onCellPointerOut],
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			if (onCellPointerMove) onCellPointerMove(event, { mouseDownAt, mouseOverAt, hoveredCell });
		},
		[mouseDownAt, mouseOverAt, hoveredCell, onCellPointerMove],
	);

	useGlobalEventListener("pointermove", handlePointerMove, {
		shouldFire: !!mouseDownAt,
	});

	return (
		<Provider value={{ mouseDownAt, mouseOverAt, hoveredCell, onCellPointerDown: handlePointerDown, onCellPointerOver: handlePointerOver, onCellPointerOut: handlePointerOut }}>
			<group {...rest}>{children}</group>
		</Provider>
	);
}

export default PlacementGridRoot;
