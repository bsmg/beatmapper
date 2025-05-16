import { type UnknownAction, combineReducers } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, groupByActionTypes, type GroupByFunction, includeAction } from "redux-undo";

import { addOneBasicEvent, bulkAddBasicEvent, bulkDeleteEvent, bulkRemoveBasicEvent, cutSelection, deleteSelectedEvents, nudgeSelection, pasteSelection, redoEvents, removeOneBasicEvent, switchEventColor, undoEvents } from "$/store/actions";

import basic from "./basic.slice";

const reducer = combineReducers({
	basic: basic.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	addOneBasicEvent.type,
	bulkAddBasicEvent.type,
	removeOneBasicEvent.type,
	deleteSelectedEvents.type,
	bulkRemoveBasicEvent.type,
	cutSelection.fulfilled.type,
	pasteSelection.fulfilled.type,
	switchEventColor.type,
	nudgeSelection.fulfilled.type,
	//
]);
const groupBy: GroupByFunction<ReturnType<typeof reducer>, UnknownAction> = groupByActionTypes([bulkAddBasicEvent.type, bulkDeleteEvent.type]);

export default {
	reducer: undoable(reducer, {
		limit: 100,
		undoType: undoEvents.type,
		redoType: redoEvents.type,
		filter: filter,
		groupBy: groupBy,
	}),
};
