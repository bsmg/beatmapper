import type { EntityId } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { finishManagingNoteSelection, startManagingNoteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorSelectionMode } from "$/store/selectors";
import { type App, ObjectSelectionMode } from "$/types";

interface UseObjectSelectionOptions<T extends App.IEditorObject> {
	interactive?: boolean;
	selectId: (item: T) => EntityId;
	onItemSelect?: (item: T, id: EntityId) => void;
	onItemDeselect?: (item: T, id: EntityId) => void;
	onItemDelete?: (item: T, id: EntityId) => void;
	onItemModify?: (item: T, id: EntityId) => void;
	onItemWheel?: (item: T, id: EntityId, delta: number) => void;
}

export function useObjectPlacement<T extends App.IEditorObject>({ interactive, selectId, onItemSelect, onItemDeselect, onItemDelete, onItemModify, onItemWheel }: UseObjectSelectionOptions<T>) {
	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);

	const activePointerIdRef = useRef<number | null>(null);

	const handlePointerDown = useCallback(
		(event: PointerEvent, data: T) => {
			if (!interactive) return;

			if (activePointerIdRef.current === event.pointerId) return;
			activePointerIdRef.current = event.pointerId;

			event.stopPropagation();

			const id = selectId(data);
			let newSelectionMode: ObjectSelectionMode | null = null;

			switch (event.button) {
				case 0: {
					newSelectionMode = data.selected ? ObjectSelectionMode.DESELECT : ObjectSelectionMode.SELECT;
					const action = !data.selected ? onItemSelect : onItemDeselect;
					action?.(data, id);
					break;
				}
				case 1: {
					newSelectionMode = null;
					onItemModify?.(data, id);
					break;
				}
				case 2: {
					newSelectionMode = ObjectSelectionMode.DELETE;
					onItemDelete?.(data, id);
					break;
				}
			}

			if (newSelectionMode) {
				dispatch(startManagingNoteSelection({ selectionMode: newSelectionMode }));
			}
		},
		[interactive, dispatch, selectId, onItemSelect, onItemDeselect, onItemDelete, onItemModify],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (!interactive) return;

			if (activePointerIdRef.current !== null && activePointerIdRef.current !== event.pointerId) {
				return;
			}

			event.stopPropagation();
			activePointerIdRef.current = null;

			window.requestAnimationFrame(() => dispatch(finishManagingNoteSelection()));
		},
		[dispatch, interactive],
	);

	useGlobalEventListener("pointerup", handlePointerUp, { shouldFire: !!selectionMode || activePointerIdRef.current !== null });
	useGlobalEventListener("pointercancel", handlePointerUp, { shouldFire: !!selectionMode || activePointerIdRef.current !== null });

	const handlePointerOver = useCallback(
		(event: PointerEvent, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			if (!selectionMode) return;

			const id = selectId(data);

			switch (selectionMode) {
				case ObjectSelectionMode.SELECT:
				case ObjectSelectionMode.DESELECT: {
					const alreadySelected = data.selected && selectionMode === ObjectSelectionMode.SELECT;
					const alreadyDeselected = !data.selected && selectionMode === ObjectSelectionMode.DESELECT;
					if (alreadySelected || alreadyDeselected) return;

					const action = !data.selected ? onItemSelect : onItemDeselect;
					action?.(data, id);
					break;
				}
				case ObjectSelectionMode.DELETE: {
					onItemDelete?.(data, id);
					break;
				}
				default:
					break;
			}
		},
		[interactive, selectionMode, selectId, onItemSelect, onItemDeselect, onItemDelete],
	);

	const handlePointerOut = useCallback(
		(event: PointerEvent, _data: T) => {
			if (!interactive) return;
			event.stopPropagation();
		},
		[interactive],
	);

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			const id = selectId(data);
			const delta = event.deltaY > 0 ? -1 : 1;

			onItemWheel?.(data, id, delta);
		},
		[interactive, selectId, onItemWheel],
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
