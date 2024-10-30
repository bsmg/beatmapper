import { type UnknownAction, combineReducers } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, groupByActionTypes, type GroupByFunction, includeAction } from "redux-undo";

import {
	bulkDeleteNote,
	clickPlacementGrid,
	createNewObstacle,
	cutSelection,
	deleteNote,
	deleteObstacle,
	deleteSelectedNotes,
	finishLoadingSong,
	nudgeSelection,
	pasteSelection,
	redoNotes,
	resizeObstacle,
	resizeSelectedObstacles,
	setBlockByDragging,
	swapSelectedNotes,
	toggleNoteColor,
	undoNotes,
} from "$/store/actions";

import notes from "./notes.slice";
import obstacles from "./obstacles.slice";

const reducer = combineReducers({
	notes: notes.reducer,
	obstacles: obstacles.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	finishLoadingSong.type,
	clickPlacementGrid.fulfilled.type,
	setBlockByDragging.fulfilled.type,
	deleteNote.type,
	bulkDeleteNote.type,
	deleteSelectedNotes.type,
	cutSelection.fulfilled.type,
	pasteSelection.fulfilled.type,
	createNewObstacle.fulfilled.type,
	resizeObstacle.type,
	resizeSelectedObstacles.type,
	deleteObstacle.type,
	swapSelectedNotes.type,
	toggleNoteColor.type,
	nudgeSelection.fulfilled.type,
	//
]);
const groupBy: GroupByFunction<ReturnType<typeof reducer>, UnknownAction> = groupByActionTypes([bulkDeleteNote.type]);

export default {
	reducer: undoable(reducer, {
		limit: 100,
		undoType: undoNotes.type,
		redoType: redoNotes.type,
		filter: filter,
		groupBy: groupBy,
	}),
};
