import type { EntityId } from "@reduxjs/toolkit";
import { NoteDirection } from "bsmap";
import { Fragment, useCallback, useMemo, useState } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { SONG_OFFSET } from "$/components/scene/constants";
import { HIGHEST_PRECISION } from "$/constants";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { deselectNote, finishManagingNoteSelection, mirrorColorNote, removeNote, selectNote, startManagingNoteSelection, updateColorNote } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCursorPositionInBeats, selectNotesEditorSelectionMode, selectVisibleBombs, selectVisibleNotes } from "$/store/selectors";
import { type App, type BeatmapId, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";
import { resolvePositionForGridObject } from "../../helpers";

import { BombNote, ColorNote } from "$/components/scene/compositions";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
function EditorNotes({ sid, bid, beatDepth, surfaceDepth, interactive }: Props) {
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const notes = useAppSelector((state) => selectVisibleNotes(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const bombs = useAppSelector((state) => selectVisibleBombs(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const selectionMode = useAppSelector(selectNotesEditorSelectionMode);
	const dispatch = useAppDispatch();

	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);
	const adjustment = useMemo(() => beatDepth * HIGHEST_PRECISION, [beatDepth]);

	const [hoveredId, setHoveredId] = useState<EntityId | null>(null);

	// I can click on a block to start selecting it.
	// If I hold the mouse down, I can drag to select (or deselect) many notes at a time.
	// For this to work, I need to know when they start clicking and stop clicking.
	// For starting clicking, I can use the `SELECT_NOTE` action, triggered when clicking a block... but they might not be over a block when they release the mouse.
	// So instead I need to use a mouseUp handler up here.
	const handlePointerUp = useCallback(
		(_: PointerEvent) => {
			if (!interactive) return;
			// Wait 1 frame before wrapping up. This is to prevent the selection mode from changing before all event-handlers have been processed.
			// Without the delay, the user might accidentally add notes to the placement grid - further up in the React tree - if they release the mouse while over a grid tile.
			window.requestAnimationFrame(() => dispatch(finishManagingNoteSelection()));
		},
		[dispatch, interactive],
	);

	useGlobalEventListener("pointerup", handlePointerUp, { shouldFire: !!selectionMode });

	const handleNotePointerDown = useCallback(
		(ev: PointerEvent, data: Pick<App.IBaseNote, "time" | "posX" | "posY" | "selected">) => {
			if (!interactive) return;
			// We can rapidly select/deselect/delete notes by clicking, holding, and dragging the cursor across the field.
			let newSelectionMode: ObjectSelectionMode | null = null;

			switch (ev.button) {
				case 0: {
					newSelectionMode = data.selected ? ObjectSelectionMode.DESELECT : ObjectSelectionMode.SELECT;
					const action = !data.selected ? selectNote : deselectNote;
					dispatch(action({ query: data }));
					break;
				}
				case 1: {
					// Middle clicks shouldnt affect selections
					newSelectionMode = null;
					dispatch(mirrorColorNote({ query: data }));
					break;
				}
				case 2: {
					newSelectionMode = ObjectSelectionMode.DELETE;
					dispatch(removeNote({ query: data }));
					break;
				}
			}

			if (newSelectionMode) {
				dispatch(startManagingNoteSelection({ selectionMode: newSelectionMode }));
			}
		},
		[dispatch, interactive],
	);

	const handleNotePointerOver = useCallback(
		(_: PointerEvent, data: Pick<App.IBaseNote, "time" | "posX" | "posY" | "selected">) => {
			if (!interactive) return;
			setHoveredId(resolveNoteId(data));
			// While selecting/deselecting/deleting notes, pointer-over events are important and should trump others.
			if (!selectionMode) return;
			switch (selectionMode) {
				case ObjectSelectionMode.SELECT:
				case ObjectSelectionMode.DESELECT: {
					const alreadySelected = data.selected && selectionMode === ObjectSelectionMode.SELECT;
					const alreadyDeselected = !data.selected && selectionMode === ObjectSelectionMode.DESELECT;
					if (alreadySelected || alreadyDeselected) return;
					const action = !data.selected ? selectNote : deselectNote;
					return dispatch(action({ query: data }));
				}
				case ObjectSelectionMode.DELETE: {
					return dispatch(removeNote({ query: data }));
				}
				default: {
					return;
				}
			}
		},
		[dispatch, interactive, selectionMode],
	);

	const handleNotePointerOut = useCallback(
		(_: PointerEvent) => {
			if (!interactive) return;
			setHoveredId(null);
		},
		[interactive],
	);

	const resolveWheelAction = useCallback(
		(event: WheelEvent, data: App.IBaseNote & { angleOffset: number }) => {
			if (!interactive) return;
			const id = resolveNoteId(data);
			// if we're not hovering over an object, no need to fire the event.
			if (!hoveredId || hoveredId !== id) return;
			const delta = event.deltaY > 0 ? -1 : 1;
			const step = 15 / delta;
			if (Object.values<number>(NoteDirection).includes(data.direction)) {
				return dispatch(updateColorNote({ query: data, changes: { angleOffset: (data.angleOffset ?? 0) + step } }));
			}
		},
		[dispatch, interactive, hoveredId],
	);

	const handleWheel = useCallback(
		(event: WheelEvent, data: App.IBaseNote & { angleOffset: number }) => {
			if (!interactive) return;
			event.preventDefault();
			if (event.altKey) {
				resolveWheelAction(event, data);
			}
		},
		[interactive, resolveWheelAction],
	);

	return (
		<Fragment>
			{notes.map((note) => {
				const position = resolvePositionForGridObject(note, { beatDepth });
				const noteZPosition = zPosition + position[2];
				const adjustedNoteZPosition = noteZPosition - adjustment;
				const color = Object.values(ObjectTool)[note.color];
				return (
					<ColorNote
						key={resolveNoteId(note)}
						data={note}
						position={position}
						color={resolveColorForItem(color, { customColors: colorScheme })}
						transparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						onNotePointerDown={handleNotePointerDown}
						onNotePointerOver={handleNotePointerOver}
						onNotePointerOut={handleNotePointerOut}
						onNoteWheel={handleWheel}
					/>
				);
			})}
			{bombs.map((note) => {
				const position = resolvePositionForGridObject(note, { beatDepth });
				const noteZPosition = zPosition + position[2];
				const adjustedNoteZPosition = noteZPosition - adjustment;
				return (
					<BombNote
						key={resolveNoteId(note)}
						data={note}
						position={position}
						color={resolveColorForItem(ObjectTool.BOMB_NOTE, { customColors: colorScheme })}
						transparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						onNotePointerDown={handleNotePointerDown}
						onNotePointerOver={handleNotePointerOver}
						onNotePointerOut={handleNotePointerOut}
					/>
				);
			})}
		</Fragment>
	);
}

export default EditorNotes;
