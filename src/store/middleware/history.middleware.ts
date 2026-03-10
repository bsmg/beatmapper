import { createListenerMiddleware, type Dispatch, type ListenerEffectAPI } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";
import { ActionCreators } from "redux-undo";

import { resolveEventId } from "$/helpers/events.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { jumpToBeat, leaveEditor, redoEvents, redoObjects, undoEvents, undoObjects } from "$/store/actions";
import { selectAllBasicEvents, selectAllBombNotes, selectAllColorNotes, selectAllObstacles, selectFutureBasicEvents, selectFutureBombNotes, selectFutureColorNotes, selectFutureObstacles, selectPastBasicEvents, selectPastBombNotes, selectPastColorNotes, selectPastObstacles } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, SongId } from "$/types/beatmap";
import { difference } from "$/utils";

function jumpToEarliestObject(api: ListenerEffectAPI<RootState, Dispatch>, songId: SongId, args: { [K in "notes" | "bombs" | "obstacles"]: { before: App.IBeatmapEntities[K]; after: App.IBeatmapEntities[K] } }) {
	const relevantNotes = difference(args.notes.before, args.notes.after, resolveNoteId);
	const relevantBombs = difference(args.bombs.before, args.bombs.after, resolveNoteId);
	const relevantObstacles = difference(args.obstacles.before, args.obstacles.after, resolveObstacleId);

	const relevantEntities = [...relevantNotes, ...relevantBombs, ...relevantObstacles].sort(sortObjectFn);
	const earliestBeat = relevantEntities.reduce((beat, entity) => Math.min(beat, entity.time), relevantEntities[0].time);

	api.dispatch(jumpToBeat({ songId, beatNum: earliestBeat, pauseTrack: true, animateJump: true }));
}

function jumpToEarliestEvent(api: ListenerEffectAPI<RootState, Dispatch>, songId: SongId, args: { [K in "basicEvents"]: { before: App.IBeatmapEntities[K]; after: App.IBeatmapEntities[K] } }) {
	const relevantEvents = difference(args.basicEvents.before, args.basicEvents.after, resolveEventId);

	const relevantEntities = [...relevantEvents].sort(sortObjectFn);
	const earliestBeat = relevantEntities.reduce((beat, entity) => Math.min(beat, entity.time), relevantEntities[0].time);

	api.dispatch(jumpToBeat({ songId, beatNum: earliestBeat, pauseTrack: true, animateJump: true }));
}

/**
 * I use redux-undo to manage undo/redo stuff, but this comes with one limitation: I want to scroll the user to the right place, when undoing/redoing.
 *
 * This middleware listens for undo events, and handles updating the cursor position in response to these actions.
 */
export default function createHistoryMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: leaveEditor,
		effect: (_, api) => {
			api.dispatch(ActionCreators.clearHistory());
		},
	});
	instance.startListening({
		actionCreator: undoObjects,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			jumpToEarliestObject(api, songId, {
				notes: { before: selectFutureColorNotes(state), after: selectAllColorNotes(state) },
				bombs: { before: selectFutureBombNotes(state), after: selectAllBombNotes(state) },
				obstacles: { before: selectFutureObstacles(state), after: selectAllObstacles(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: redoObjects,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			jumpToEarliestObject(api, songId, {
				notes: { before: selectPastColorNotes(state), after: selectAllColorNotes(state) },
				bombs: { before: selectPastBombNotes(state), after: selectAllBombNotes(state) },
				obstacles: { before: selectPastObstacles(state), after: selectAllObstacles(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: undoEvents,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			jumpToEarliestEvent(api, songId, {
				basicEvents: { before: selectFutureBasicEvents(state), after: selectAllBasicEvents(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: redoEvents,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			jumpToEarliestEvent(api, songId, {
				basicEvents: { before: selectPastBasicEvents(state), after: selectAllBasicEvents(state) },
			});
		},
	});

	return instance.middleware;
}
