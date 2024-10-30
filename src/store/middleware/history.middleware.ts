import { type MiddlewareAPI, createListenerMiddleware } from "@reduxjs/toolkit";

import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { getBeatNumForItem } from "$/helpers/item.helpers";
import * as actions from "$/store/actions";
import { getBeatDepth, getCursorPositionInBeats, getEvents, getFutureEvents, getFutureNotes, getFutureObstacles, getGraphicsLevel, getNotes, getObstacles, getPastEvents, getPastNotes, getPastObstacles, getStartAndEndBeat } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, Json } from "$/types";
import { findUniquesWithinArrays } from "$/utils";

function jumpToEarliestNote(args: { earlierNotes: Json.Note[]; laterNotes: Json.Note[]; earlierObstacles: App.Obstacle[]; laterObstacles: App.Obstacle[] }, api: MiddlewareAPI) {
	const relevantNotes = findUniquesWithinArrays(args.earlierNotes, args.laterNotes);
	const relevantObstacles = findUniquesWithinArrays(args.earlierObstacles, args.laterObstacles);

	if (relevantNotes.length === 0 && relevantObstacles.length === 0) {
		return;
	}

	const relevantEntities = [relevantNotes, relevantObstacles].find((entity) => entity.length > 0) ?? [];

	// For now, assume that the first entity is the earliest.
	// Might make sense to sort them, so that if I delete a selected cluster it brings me to the start of that cluster?
	const earliestEntity = relevantEntities[0];

	// Is this note within our visible range? If not, jump to it.
	const state = api.getState();
	const cursorPositionInBeats = getCursorPositionInBeats(state);
	const beatDepth = getBeatDepth(state);
	const graphicsLevel = getGraphicsLevel(state);

	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel);

	const entityTime = getBeatNumForItem(earliestEntity);

	const isEntityVisible = entityTime > closeLimit && entityTime < farLimit;

	if (!isEntityVisible) {
		api.dispatch(actions.jumpToBeat({ beatNum: entityTime, pauseTrack: true, animateJump: true }));
	}
}

function switchEventPagesIfNecessary(args: { earlierEvents: App.Event[]; currentEvents: App.Event[] }, api: MiddlewareAPI) {
	const relevantEvents = findUniquesWithinArrays(args.earlierEvents, args.currentEvents);

	if (relevantEvents.length === 0) {
		return;
	}

	const { startBeat, endBeat } = getStartAndEndBeat(api.getState());

	const someItemsWithinWindow = relevantEvents.some((event) => {
		return event.beatNum >= startBeat && event.beatNum < endBeat;
	});

	if (someItemsWithinWindow) {
		return;
	}

	const earliestBeatOutOfWindow = relevantEvents.find((event) => {
		return event.beatNum < startBeat || event.beatNum >= endBeat;
	});

	// Should be impossible
	if (!earliestBeatOutOfWindow) {
		return;
	}

	api.dispatch(actions.jumpToBeat({ beatNum: earliestBeatOutOfWindow.beatNum, pauseTrack: true, animateJump: true }));
}

/**
 * I use redux-undo to manage undo/redo stuff, but this comes with one limitation: I want to scroll the user to the right place, when undoing/redoing.
 *
 * This middleware listens for undo events, and handles updating the cursor position in response to these actions.
 */
export default function createHistoryMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: actions.undoNotes,
		effect: (_, api) => {
			const state = api.getState();
			const pastNotes = getPastNotes(state);
			const presentNotes = getNotes(state);
			const pastObstacles = getPastObstacles(state);
			const presentObstacles = getObstacles(state);
			if (!pastNotes.length) return;
			jumpToEarliestNote({ earlierNotes: pastNotes, laterNotes: presentNotes, earlierObstacles: pastObstacles, laterObstacles: presentObstacles }, api);
		},
	});
	instance.startListening({
		actionCreator: actions.redoNotes,
		effect: (_, api) => {
			const state = api.getState();
			const presentNotes = getNotes(state);
			const futureNotes = getFutureNotes(state);
			const presentObstacles = getObstacles(state);
			const futureObstacles = getFutureObstacles(state);
			if (!futureNotes.length) return;
			jumpToEarliestNote({ earlierNotes: presentNotes, laterNotes: futureNotes, earlierObstacles: presentObstacles, laterObstacles: futureObstacles }, api);
		},
	});
	instance.startListening({
		actionCreator: actions.undoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const pastEvents = getPastEvents(state);
			const presentEvents = getEvents(state);
			if (pastEvents === null) return;
			switchEventPagesIfNecessary({ earlierEvents: pastEvents, currentEvents: presentEvents }, api);
		},
	});
	instance.startListening({
		actionCreator: actions.redoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const presentEvents = getEvents(state);
			const futureEvents = getFutureEvents(state);
			if (futureEvents === null) return;
			switchEventPagesIfNecessary({ earlierEvents: presentEvents, currentEvents: futureEvents }, api);
		},
	});

	return instance.middleware;
}
