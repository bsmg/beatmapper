import { combineReducers, type UnknownAction } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, type GroupByFunction, groupByActionTypes, includeAction } from "redux-undo";

import { addBasicEvent, bulkAddBasicEvent, bulkRemoveEvent, cutSelection, loadBeatmapEntities, mirrorBasicEvent, nudgeSelection, pasteSelection, redoEvents, removeAllSelectedEvents, removeEvent, undoEvents } from "$/store/actions";
import basic from "./basic.slice";

const reducer = combineReducers({
	basic: basic.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	loadBeatmapEntities.type,
	addBasicEvent.type,
	bulkAddBasicEvent.type,
	removeEvent.type,
	bulkRemoveEvent.type,
	mirrorBasicEvent.type,
	removeAllSelectedEvents.type,
	cutSelection.fulfilled.type,
	pasteSelection.fulfilled.type,
	nudgeSelection.fulfilled.type,
	//
]);
const groupBy: GroupByFunction<ReturnType<typeof reducer>, UnknownAction> = groupByActionTypes([bulkAddBasicEvent.type, bulkRemoveEvent.type]);

export default {
	reducer: undoable(reducer, {
		limit: 100,
		ignoreInitialState: true,
		undoType: undoEvents.type,
		redoType: redoEvents.type,
		filter: filter,
		groupBy: groupBy,
	}),
};
