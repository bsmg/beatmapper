import { usePressedKeys } from "@ark-ui/react/hotkeys";
import type { ThreeEvent } from "@react-three/fiber";
import type { EntityId } from "@reduxjs/toolkit";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useCallback, useRef } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { finishManagingNoteSelection, startManagingNoteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectNotesEditorSelectionMode, selectPacerWait } from "$/store/selectors";
import { type App, ObjectSelectionMode } from "$/types";

interface UseObjectSelectionOptions<T extends App.IEditorObject> {
	interactive?: boolean;
	selectId: (item: T) => EntityId;
	onItemSelect?: (item: T, id: EntityId) => void;
	onItemDeselect?: (item: T, id: EntityId) => void;
	onItemDelete?: (item: T, id: EntityId) => void;
	onItemModifyClick?: (item: T, id: EntityId, shiftKey: boolean) => void;
	onItemModifyWheel?: (item: T, id: EntityId, delta: number, shiftKey: boolean) => void;
	onItemModifyKeys?: (item: T, id: EntityId, keys: string[], shiftKey: boolean) => void;
}

export function useObjectPlacement<T extends App.IEditorObject>({ interactive, selectId, onItemSelect, onItemDeselect, onItemDelete, onItemModifyClick, onItemModifyKeys, onItemModifyWheel }: UseObjectSelectionOptions<T>) {
	const dispatch = useAppDispatch();
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const wait = useAppSelector(selectPacerWait);
	const pressedKeys = usePressedKeys();

	const activePointerIdRef = useRef<number | null>(null);
	const hoveredItemRef = useRef<{ item: T; id: EntityId } | null>(null);

	const handlePointerDown = useCallback(
		(event: ThreeEvent<PointerEvent>, data: T) => {
			if (!interactive) return;

			if (activePointerIdRef.current === event.pointerId) return;
			activePointerIdRef.current = event.pointerId;

			event.nativeEvent.stopPropagation();

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
					onItemModifyClick?.(data, id, event.shiftKey);
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
		[interactive, dispatch, selectId, onItemSelect, onItemDeselect, onItemDelete, onItemModifyClick],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (!interactive || document.pointerLockElement) return;

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
		(event: ThreeEvent<PointerEvent>, data: T) => {
			if (!interactive) return;
			event.nativeEvent.stopPropagation();

			const id = selectId(data);
			hoveredItemRef.current = { item: data, id };

			if (!selectionMode) return;

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
		(event: ThreeEvent<PointerEvent>, _data: T) => {
			if (!interactive) return;
			event.nativeEvent.stopPropagation();
			hoveredItemRef.current = null;
		},
		[interactive],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!interactive || !hoveredItemRef.current) return;
			const { item, id } = hoveredItemRef.current;
			onItemModifyKeys?.(item, id, pressedKeys, event.shiftKey);
		},
		[interactive, onItemModifyKeys, pressedKeys],
	);

	useGlobalEventListener("keydown", handleKeyDown, { shouldFire: interactive && hoveredItemRef.current !== null });

	const resolveWheelAction = useThrottledCallback(
		(event: ThreeEvent<WheelEvent>, data: T) => {
			if (!interactive) return;
			event.stopPropagation();

			const id = selectId(data);
			const delta = event.deltaY > 0 ? -1 : 1;

			onItemModifyWheel?.(data, id, delta, event.shiftKey);
		},
		{ wait: wait },
	);

	const handleWheel = useCallback(
		(event: ThreeEvent<WheelEvent>, data: T) => {
			if (event.altKey) {
				event.nativeEvent.stopPropagation();
				resolveWheelAction(event, data);
			}
		},
		[resolveWheelAction],
	);

	return { handlePointerDown, handlePointerOver, handlePointerOut, handleWheel };
}
