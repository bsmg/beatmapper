import { createListenerMiddleware, type ListenerEffectAPI } from "@reduxjs/toolkit";
import { sortObjectFn } from "bsmap";

import { resolveEventId } from "$/helpers/events.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { getRouter, selectActiveSongId } from "$/router";
import { clearEventHistory, clearObjectHistory, jumpToBeat, leaveEditor, redoEvents, redoObjects, undoEvents, undoObjects } from "$/store/actions";
import {
	selectAllBasicEvents,
	selectAllBombNotes,
	selectAllBoostEvents,
	selectAllColorNotes,
	selectAllObstacles,
	selectFutureBasicEvents,
	selectFutureBombNotes,
	selectFutureBoostEvents,
	selectFutureColorNotes,
	selectFutureObstacles,
	selectPastBasicEvents,
	selectPastBombNotes,
	selectPastBoostEvents,
	selectPastColorNotes,
	selectPastObstacles,
} from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/setup";
import type { App, SongId } from "$/types";
import { difference } from "$/utils";

function jumpToEarliestObject(api: ListenerEffectAPI<RootState, AppDispatch>, songId: SongId, args: { [K in "notes" | "bombs" | "obstacles"]: { before: App.IBeatmapEntities[K]; after: App.IBeatmapEntities[K] } }) {
	const relevantNotes = difference(args.notes.before, args.notes.after, resolveNoteId);
	const relevantBombs = difference(args.bombs.before, args.bombs.after, resolveNoteId);
	const relevantObstacles = difference(args.obstacles.before, args.obstacles.after, resolveObstacleId);

	const relevantEntities = [...relevantNotes, ...relevantBombs, ...relevantObstacles].sort(sortObjectFn);
	const earliestBeat = relevantEntities.reduce((beat, entity) => Math.min(beat, entity.time), relevantEntities[0].time);

	api.dispatch(jumpToBeat({ songId, value: earliestBeat, pauseTrack: true, animateJump: true }));
}

function jumpToEarliestEvent(api: ListenerEffectAPI<RootState, AppDispatch>, songId: SongId, args: { [K in "basicEvents" | "boostEvents"]: { before: App.IBeatmapEntities[K]; after: App.IBeatmapEntities[K] } }) {
	const relevantBasicEvents = difference(args.basicEvents.before, args.basicEvents.after, resolveEventId);
	const relevantBoostEvents = difference(args.boostEvents.before, args.boostEvents.after, resolveEventId);

	const relevantEntities = [...relevantBasicEvents, ...relevantBoostEvents].sort(sortObjectFn);
	const earliestBeat = relevantEntities.reduce((beat, entity) => Math.min(beat, entity.time), relevantEntities[0].time);

	api.dispatch(jumpToBeat({ songId, value: earliestBeat, pauseTrack: true, animateJump: true }));
}

/**
 * I use redux-undo to manage undo/redo stuff, but this comes with one limitation: I want to scroll the user to the right place, when undoing/redoing.
 *
 * This middleware listens for undo events, and handles updating the cursor position in response to these actions.
 */
export default function createHistoryMiddleware() {
	const instance = createListenerMiddleware<RootState, AppDispatch, AppExtraArgs>({
		extra: { getRouter },
	});

	instance.startListening({
		actionCreator: leaveEditor,
		effect: (_, api) => {
			api.dispatch(clearObjectHistory());
			api.dispatch(clearEventHistory());
		},
	});
	instance.startListening({
		actionCreator: undoObjects,
		effect: (_, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			jumpToEarliestObject(api, songId, {
				notes: { before: selectFutureColorNotes(state), after: selectAllColorNotes(state) },
				bombs: { before: selectFutureBombNotes(state), after: selectAllBombNotes(state) },
				obstacles: { before: selectFutureObstacles(state), after: selectAllObstacles(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: redoObjects,
		effect: (_, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			jumpToEarliestObject(api, songId, {
				notes: { before: selectPastColorNotes(state), after: selectAllColorNotes(state) },
				bombs: { before: selectPastBombNotes(state), after: selectAllBombNotes(state) },
				obstacles: { before: selectPastObstacles(state), after: selectAllObstacles(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: undoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			jumpToEarliestEvent(api, songId, {
				basicEvents: { before: selectFutureBasicEvents(state), after: selectAllBasicEvents(state) },
				boostEvents: { before: selectFutureBoostEvents(state), after: selectAllBoostEvents(state) },
			});
		},
	});
	instance.startListening({
		actionCreator: redoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const songId = selectActiveSongId(api.extra.getRouter());

			jumpToEarliestEvent(api, songId, {
				basicEvents: { before: selectPastBasicEvents(state), after: selectAllBasicEvents(state) },
				boostEvents: { before: selectPastBoostEvents(state), after: selectAllBoostEvents(state) },
			});
		},
	});

	return instance.middleware;
}
