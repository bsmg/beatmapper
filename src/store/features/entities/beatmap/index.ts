import { combineReducers, type UnknownAction } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, type GroupByFunction, groupByActionTypes, includeAction } from "redux-undo";

import { addObstacle, addToCell, bulkRemoveNote, cutSelection, finishLoadingMap, mirrorColorNote, mirrorSelection, nudgeSelection, pasteSelection, redoObjects, removeAllSelectedObjects, removeNote, removeObstacle, undoObjects, updateAllSelectedObstacles, updateObstacle } from "$/store/actions";
import bombs from "./bombs.slice";
import notes from "./notes.slice";
import obstacles from "./obstacles.slice";

const reducer = combineReducers({
	bombs: bombs.reducer,
	notes: notes.reducer,
	obstacles: obstacles.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	finishLoadingMap.type,
	addToCell.fulfilled.type,
	removeNote.type,
	bulkRemoveNote.type,
	mirrorColorNote.type,
	addObstacle.fulfilled.type,
	updateObstacle.type,
	updateAllSelectedObstacles.type,
	removeObstacle.type,
	mirrorSelection.type,
	removeAllSelectedObjects.type,
	cutSelection.fulfilled.type,
	pasteSelection.fulfilled.type,
	nudgeSelection.fulfilled.type,
	//
]);
const groupBy: GroupByFunction<ReturnType<typeof reducer>, UnknownAction> = groupByActionTypes([bulkRemoveNote.type]);

export default {
	reducer: undoable(reducer, {
		limit: 100,
		undoType: undoObjects.type,
		redoType: redoObjects.type,
		filter: filter,
		groupBy: groupBy,
	}),
};
