import type { EntityId } from "@reduxjs/toolkit";
import { useCallback } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { finishManagingNoteSelection, startManagingNoteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorSelectionMode } from "$/store/selectors";
import { ObjectSelectionMode } from "$/types";

interface UseObjectSelectionOptions<T> {
	interactive?: boolean;
	selectId: (item: T) => EntityId;
	selectItemSelected: (item: T) => boolean;
	onItemSelect?: (item: T) => void;
	onItemDeselect?: (item: T) => void;
	onItemDelete?: (item: T) => void;
	onItemModify?: (item: T) => void;
	onItemWheel?: (item: T, delta: number) => void;
}
export function useObjectPlacement<T>({ interactive, selectItemSelected, onItemSelect, onItemDeselect, onItemDelete, onItemModify, onItemWheel }: UseObjectSelectionOptions<T>) {
	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);

	const handlePointerDown = useCallback(
		(event: PointerEvent, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			const selected = selectItemSelected(data);

			// We can rapidly select/deselect/delete notes by clicking, holding, and dragging the cursor across the field.
			let newSelectionMode: ObjectSelectionMode | null = null;

			switch (event.button) {
				case 0: {
					newSelectionMode = selected ? ObjectSelectionMode.DESELECT : ObjectSelectionMode.SELECT;
					const action = !selected ? onItemSelect : onItemDeselect;
					if (action) action(data);
					break;
				}
				case 1: {
					// Middle clicks shouldnt affect selections
					newSelectionMode = null;
					if (onItemModify) onItemModify(data);
					break;
				}
				case 2: {
					newSelectionMode = ObjectSelectionMode.DELETE;
					if (onItemDelete) onItemDelete(data);
					break;
				}
			}

			if (newSelectionMode) {
				dispatch(startManagingNoteSelection({ selectionMode: newSelectionMode }));
			}
		},
		[interactive, dispatch, selectItemSelected, onItemSelect, onItemDeselect, onItemDelete, onItemModify],
	);

	// I can click on a block to start selecting it.
	// If I hold the mouse down, I can drag to select (or deselect) many notes at a time.
	// For this to work, I need to know when they start clicking and stop clicking.
	// For starting clicking, I can use the `SELECT_NOTE` action, triggered when clicking a block... but they might not be over a block when they release the mouse.
	// So instead I need to use a mouseUp handler up here.
	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (!interactive) return;
			event.stopPropagation();

			// Wait 1 frame before wrapping up. This is to prevent the selection mode from changing before all event-handlers have been processed.
			// Without the delay, the user might accidentally add notes to the placement grid - further up in the React tree - if they release the mouse while over a grid tile.
			window.requestAnimationFrame(() => dispatch(finishManagingNoteSelection()));
		},
		[dispatch, interactive],
	);

	useGlobalEventListener("pointerup", handlePointerUp, { shouldFire: !!selectionMode });

	const handlePointerOver = useCallback(
		(event: PointerEvent, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			const selected = selectItemSelected(data);
			// While selecting/deselecting/deleting notes, pointer-over events are important and should trump others.
			if (!selectionMode) return;
			switch (selectionMode) {
				case ObjectSelectionMode.SELECT:
				case ObjectSelectionMode.DESELECT: {
					const alreadySelected = selected && selectionMode === ObjectSelectionMode.SELECT;
					const alreadyDeselected = !selected && selectionMode === ObjectSelectionMode.DESELECT;
					if (alreadySelected || alreadyDeselected) return;
					const action = !selected ? onItemSelect : onItemDeselect;
					if (!action) return;
					return action(data);
				}
				case ObjectSelectionMode.DELETE: {
					if (!onItemDelete) return;
					return onItemDelete(data);
				}
				default: {
					return;
				}
			}
		},
		[interactive, selectionMode, selectItemSelected, onItemSelect, onItemDeselect, onItemDelete],
	);

	const handlePointerOut = useCallback(
		(event: PointerEvent) => {
			if (!interactive) return;
			event.stopPropagation();
		},
		[interactive],
	);

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			// if we're not hovering over an object, no need to fire the event.
			const delta = event.deltaY > 0 ? -1 : 1;

			if (onItemWheel) return onItemWheel(data, delta);
		},
		[interactive, onItemWheel],
	);

	const handleWheel = useCallback(
		(event: WheelEvent, data: T) => {
			if (event.altKey) {
				resolveWheelAction(event, data);
			}
		},
		[resolveWheelAction],
	);

	return { handlePointerDown, handlePointerOver, handlePointerOut, handleWheel };
}
