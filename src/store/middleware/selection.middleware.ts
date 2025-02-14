// TODO: I don't really think this middleware is necessary.
// I think all this stuff can be done at the component level, maybe put into helper functions if it feels crowded.
// Will do a different approach for events. This is just for notes-view stuff.

import { createListenerMiddleware } from "@reduxjs/toolkit";

import { bulkDeleteNote, clickNote, deleteNote, deselectNote, mouseOverNote, selectNote, toggleNoteColor } from "$/store/actions";
import { selectNoteByPosition, selectNoteEditorSelectionMode } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { ObjectSelectionMode } from "$/types";

export default function createSelectionMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: clickNote,
		effect: (action, api) => {
			const state = api.getState();
			const { clickType, time: beatNum, lineIndex: colIndex, lineLayer: rowIndex } = action.payload;
			const note = selectNoteByPosition(state, { beatNum, colIndex, rowIndex });
			if (!note) return;
			if (clickType === "middle") {
				api.dispatch(toggleNoteColor({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			} else if (clickType === "right") {
				api.dispatch(deleteNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			} else if (note.selected) {
				api.dispatch(deselectNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			} else {
				api.dispatch(selectNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			}
		},
	});
	instance.startListening({
		actionCreator: mouseOverNote,
		effect: (action, api) => {
			const state = api.getState();
			const { time: beatNum, lineIndex: colIndex, lineLayer: rowIndex } = action.payload;
			const selectionMode = selectNoteEditorSelectionMode(state);
			if (!selectionMode) return;
			// Find the note we're mousing over
			const note = selectNoteByPosition(state, { beatNum, colIndex, rowIndex });
			if (!note) return;
			// If the selection mode is delete, we can simply remove this note.
			if (selectionMode === ObjectSelectionMode.DELETE) api.dispatch(bulkDeleteNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			// Ignore double-positives or double-negatives
			const alreadySelected = note.selected && selectionMode === ObjectSelectionMode.SELECT;
			const alreadyDeselected = !note.selected && selectionMode === ObjectSelectionMode.DESELECT;
			if (alreadySelected || alreadyDeselected) return;
			if (note.selected) api.dispatch(deselectNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
			api.dispatch(selectNote({ time: beatNum, lineIndex: colIndex, lineLayer: rowIndex }));
		},
	});

	return instance.middleware;
}
