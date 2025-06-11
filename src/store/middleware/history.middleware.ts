import { type MiddlewareAPI, createListenerMiddleware } from "@reduxjs/toolkit";

import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { resolveTimeForItem } from "$/helpers/item.helpers";
import {
	selectAllBasicEvents,
	selectAllBombNotes,
	selectAllColorNotes,
	selectAllObstacles,
	selectBeatDepth,
	selectCursorPositionInBeats,
	selectEventEditorStartAndEndBeat,
	selectFutureBasicEvents,
	selectFutureBombNotes,
	selectFutureColorNotes,
	selectFutureObstacles,
	selectPastBasicEvents,
	selectPastBombNotes,
	selectPastColorNotes,
	selectPastObstacles,
	selectSurfaceDepth,
} from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { App, SongId } from "$/types";
import { findUniquesWithinArrays } from "$/utils";
import { jumpToBeat, redoEvents, redoObjects, undoEvents, undoObjects } from "../actions";

function jumpToEarliestNote(api: MiddlewareAPI, songId: SongId, args: { [K in "notes" | "bombs" | "obstacles"]: { past: App.IBeatmapEntities[K]; future: App.IBeatmapEntities[K] } }) {
	const relevantNotes = findUniquesWithinArrays(args.notes.past, args.notes.future);
	const relevantBombs = findUniquesWithinArrays(args.bombs.past, args.bombs.future);
	const relevantObstacles = findUniquesWithinArrays(args.obstacles.past, args.obstacles.future);

	if (relevantNotes.length === 0 && relevantBombs.length === 0 && relevantObstacles.length === 0) {
		return;
	}

	const relevantEntities = [relevantNotes, relevantBombs, relevantObstacles].find((entity) => entity.length > 0) ?? [];

	// For now, assume that the first entity is the earliest.
	// Might make sense to sort them, so that if I delete a selected cluster it brings me to the start of that cluster?
	const earliestEntity = relevantEntities[0];

	// Is this note within our visible range? If not, jump to it.
	const state = api.getState();
	const cursorPositionInBeats = selectCursorPositionInBeats(state, songId);
	const beatDepth = selectBeatDepth(state);
	const surfaceDepth = selectSurfaceDepth(state);

	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, surfaceDepth / beatDepth);

	const entityTime = resolveTimeForItem(earliestEntity);

	const isEntityVisible = entityTime > closeLimit && entityTime < farLimit;

	if (!isEntityVisible) {
		api.dispatch(jumpToBeat({ songId, beatNum: entityTime, pauseTrack: true, animateJump: true }));
	}
}

function switchEventPagesIfNecessary(api: MiddlewareAPI, songId: SongId, args: { [K in "events"]: { past: App.IBeatmapEntities[K]; future: App.IBeatmapEntities[K] } }) {
	const state = api.getState() as RootState;
	const relevantEvents = findUniquesWithinArrays(args.events.past, args.events.future);

	if (relevantEvents.length === 0) {
		return;
	}

	const { startBeat, endBeat } = selectEventEditorStartAndEndBeat(state, songId);

	const someItemsWithinWindow = relevantEvents.some((event) => {
		return event.time >= startBeat && event.time < endBeat;
	});

	if (someItemsWithinWindow) {
		return;
	}

	const earliestBeatOutOfWindow = relevantEvents.find((event) => {
		return event.time < startBeat || event.time >= endBeat;
	});

	// Should be impossible
	if (!earliestBeatOutOfWindow) {
		return;
	}

	api.dispatch(jumpToBeat({ songId, beatNum: earliestBeatOutOfWindow.time, pauseTrack: true, animateJump: true }));
}

/**
 * I use redux-undo to manage undo/redo stuff, but this comes with one limitation: I want to scroll the user to the right place, when undoing/redoing.
 *
 * This middleware listens for undo events, and handles updating the cursor position in response to these actions.
 */
export default function createHistoryMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: undoObjects,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const pastNotes = selectPastColorNotes(state);
			const presentNotes = selectAllColorNotes(state);
			const pastBombs = selectPastBombNotes(state);
			const presentBombs = selectAllBombNotes(state);
			const pastObstacles = selectPastObstacles(state);
			const presentObstacles = selectAllObstacles(state);
			if (!pastNotes.length) return;
			jumpToEarliestNote(api, songId, {
				notes: { past: pastNotes, future: presentNotes },
				bombs: { past: pastBombs, future: presentBombs },
				obstacles: { past: pastObstacles, future: presentObstacles },
			});
		},
	});
	instance.startListening({
		actionCreator: redoObjects,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const presentNotes = selectAllColorNotes(state);
			const futureNotes = selectFutureColorNotes(state);
			const presentBombs = selectAllBombNotes(state);
			const futureBombs = selectFutureBombNotes(state);
			const presentObstacles = selectAllObstacles(state);
			const futureObstacles = selectFutureObstacles(state);
			if (!futureNotes.length) return;
			jumpToEarliestNote(api, songId, {
				notes: { past: presentNotes, future: futureNotes },
				bombs: { past: presentBombs, future: futureBombs },
				obstacles: { past: presentObstacles, future: futureObstacles },
			});
		},
	});
	instance.startListening({
		actionCreator: undoEvents,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const pastEvents = selectPastBasicEvents(state);
			const presentEvents = selectAllBasicEvents(state);
			if (pastEvents === null) return;
			switchEventPagesIfNecessary(api, songId, {
				events: { past: pastEvents, future: presentEvents },
			});
		},
	});
	instance.startListening({
		actionCreator: redoEvents,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const presentEvents = selectAllBasicEvents(state);
			const futureEvents = selectFutureBasicEvents(state);
			if (futureEvents === null) return;
			switchEventPagesIfNecessary(api, songId, {
				events: { past: presentEvents, future: futureEvents },
			});
		},
	});

	return instance.middleware;
}
