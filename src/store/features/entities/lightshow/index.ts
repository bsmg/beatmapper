import { type UnknownAction, combineReducers } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, groupByActionTypes, type GroupByFunction, includeAction } from "redux-undo";

import { bulkDeleteEvent, changeLaserSpeed, cutSelection, deleteEvent, deleteSelectedEvents, nudgeSelection, pasteSelection, placeEvent, redoEvents, switchEventColor, undoEvents } from "$/store/actions";

import tracks from "./tracks.slice";

const reducer = combineReducers({
	tracks: tracks.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	placeEvent.type,
	changeLaserSpeed.type,
	deleteEvent.type,
	deleteSelectedEvents.type,
	bulkDeleteEvent.type,
	cutSelection.fulfilled.type,
	pasteSelection.fulfilled.type,
	switchEventColor.type,
	nudgeSelection.fulfilled.type,
	//
]);
const groupBy: GroupByFunction<ReturnType<typeof reducer>, UnknownAction> = groupByActionTypes([bulkDeleteEvent.type]);

export default {
	reducer: undoable(reducer, {
		limit: 100,
		undoType: undoEvents.type,
		redoType: redoEvents.type,
		filter: filter,
		groupBy: groupBy,
	}),
};
