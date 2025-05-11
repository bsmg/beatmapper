import { Fragment, useCallback, useMemo } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { SONG_OFFSET } from "$/components/scene/constants";
import { HIGHEST_PRECISION } from "$/constants";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { clickNote, finishManagingNoteSelection, mouseOverNote, startManagingNoteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectCursorPositionInBeats, selectCustomColors, selectNoteEditorSelectionMode, selectVisibleBombs, selectVisibleNotes } from "$/store/selectors";
import { type App, ObjectSelectionMode, ObjectTool, type SongId } from "$/types";
import { roundAwayFloatingPointNonsense } from "$/utils";

import { BombNote, ColorNote, resolvePositionForNote } from "$/components/scene/compositions";
import { resolveNoteId } from "$/helpers/notes.helpers";

interface Props {
	sid: SongId;
}
function EditorNotes({ sid }: Props) {
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const notes = useAppSelector((state) => selectVisibleNotes(state, sid));
	const bombs = useAppSelector((state) => selectVisibleBombs(state, sid));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const selectionMode = useAppSelector(selectNoteEditorSelectionMode);
	const dispatch = useAppDispatch();

	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);

	// I can click on a block to start selecting it.
	// If I hold the mouse down, I can drag to select (or deselect) many notes at a time.
	// For this to work, I need to know when they start clicking and stop clicking.
	// For starting clicking, I can use the `SELECT_NOTE` action, triggered when clicking a block... but they might not be over a block when they release the mouse.
	// So instead I need to use a mouseUp handler up here.
	useGlobalEventListener(
		"pointerup",
		() => {
			// Wait 1 frame before wrapping up. This is to prevent the selection mode from changing before all event-handlers have been processed.
			// Without the delay, the user might accidentally add notes to the placement grid - further up in the React tree - if they release the mouse while over a grid tile.
			window.requestAnimationFrame(() => dispatch(finishManagingNoteSelection()));
		},
		{ shouldFire: !!selectionMode },
	);

	const handleClick = useCallback(
		(ev: PointerEvent, data: Pick<App.IBaseNote, "time" | "posX" | "posY" | "selected">) => {
			// We can rapidly select/deselect/delete notes by clicking, holding, and dragging the cursor across the field.
			let newSelectionMode: ObjectSelectionMode | null = null;
			if (ev.button === 0) {
				newSelectionMode = data.selected ? ObjectSelectionMode.DESELECT : ObjectSelectionMode.SELECT;
			} else if (ev.button === 1) {
				// Middle clicks shouldnt affect selections
				newSelectionMode = null;
			} else if (ev.button === 2) {
				newSelectionMode = ObjectSelectionMode.DELETE;
			}

			if (newSelectionMode) {
				dispatch(startManagingNoteSelection({ selectionMode: newSelectionMode }));
			}

			const supportedClickType = ev.button === 0 ? "left" : ev.button === 1 ? "middle" : ev.button === 2 ? "right" : undefined;

			if (supportedClickType) {
				dispatch(clickNote({ clickType: supportedClickType, time: data.time, posY: data.posY, posX: data.posX }));
			}
		},
		[dispatch],
	);

	const handlePointerOver = useCallback(
		(_: PointerEvent, data: Pick<App.IBaseNote, "time" | "posX" | "posY" | "selected">) => {
			// While selecting/deselecting/deleting notes, pointer-over events are important and should trump others.
			if (selectionMode) {
				dispatch(mouseOverNote({ time: data.time, posY: data.posY, posX: data.posX }));
			}
		},
		[dispatch, selectionMode],
	);

	return (
		<Fragment>
			{notes.map((note) => {
				const { x, y, z } = resolvePositionForNote(note, beatDepth);
				const noteZPosition = roundAwayFloatingPointNonsense(zPosition + z);
				// HACK: So I'm winding up with zPositions of like 11.999994, and it's making the notes transparent because they're 0.000006 before the placement grid.
				// I imagine there's a better place to manage this than here, but I'm sick of this problem.
				const adjustment = beatDepth * HIGHEST_PRECISION;
				const adjustedNoteZPosition = noteZPosition - adjustment;

				const color = Object.values(ObjectTool)[note.color];

				return <ColorNote key={resolveNoteId(note)} data={note} position={[x, y, z]} color={resolveColorForItem(color, customColors)} transparent={adjustedNoteZPosition > -SONG_OFFSET * 2} onNoteClick={handleClick} onNoteMouseOver={handlePointerOver} />;
			})}
			{bombs.map((note) => {
				const { x, y, z } = resolvePositionForNote(note, beatDepth);
				const noteZPosition = roundAwayFloatingPointNonsense(zPosition + z);
				// HACK: So I'm winding up with zPositions of like 11.999994, and it's making the notes transparent because they're 0.000006 before the placement grid.
				// I imagine there's a better place to manage this than here, but I'm sick of this problem.
				const adjustment = beatDepth * HIGHEST_PRECISION;
				const adjustedNoteZPosition = noteZPosition - adjustment;

				return <BombNote key={resolveNoteId(note)} data={note} position={[x, y, z]} color={resolveColorForItem(ObjectTool.BOMB_NOTE, customColors)} transparent={adjustedNoteZPosition > -SONG_OFFSET * 2} onNoteClick={handleClick} onNoteMouseOver={handlePointerOver} />;
			})}
		</Fragment>
	);
}

export default EditorNotes;
