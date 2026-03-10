import { combineReducers, type UnknownAction } from "@reduxjs/toolkit";
import undoable, { type FilterFunction, type GroupByFunction, groupByActionTypes, includeAction } from "redux-undo";

import { addBasicEvent, addBoostEvent, bulkAddBasicEvent, bulkAddBoostEvent, bulkRemoveEvent, cutSelection, loadBeatmapEntities, mirrorBasicEvent, nudgeSelection, pasteSelection, redoEvents, removeAllSelectedEvents, removeEvent, undoEvents, updateBasicEvent, updateBoostEvent } from "$/store/actions";
import basicEvents from "./basic.slice";
import boostEvents from "./boost.slice";

const reducer = combineReducers({
	basicEvents: basicEvents.reducer,
	boostEvents: boostEvents.reducer,
});

const filter: FilterFunction<ReturnType<typeof reducer>, UnknownAction> = includeAction([
	loadBeatmapEntities.type,
	addBasicEvent.type,
	bulkAddBasicEvent.type,
	updateBasicEvent.type,
	mirrorBasicEvent.type,
	addBoostEvent.type,
	bulkAddBoostEvent.type,
	updateBoostEvent.type,
	removeEvent.type,
	bulkRemoveEvent.type,
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
