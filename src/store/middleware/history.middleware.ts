import { type MiddlewareAPI, createListenerMiddleware } from "@reduxjs/toolkit";

import { calculateVisibleRange } from "$/helpers/editor.helpers";
import { resolveBeatForItem } from "$/helpers/item.helpers";
import * as actions from "$/store/actions";
import {
	selectActiveSongId,
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
	selectGraphicsQuality,
	selectPastBasicEvents,
	selectPastBombNotes,
	selectPastColorNotes,
	selectPastObstacles,
} from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { BeatmapEntities } from "$/types";
import { findUniquesWithinArrays } from "$/utils";

function jumpToEarliestNote(api: MiddlewareAPI, args: { [K in "notes" | "bombs" | "obstacles"]: { past: BeatmapEntities[K]; future: BeatmapEntities[K] } }) {
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
	const songId = selectActiveSongId(state);
	const cursorPositionInBeats = selectCursorPositionInBeats(state, songId);
	const beatDepth = selectBeatDepth(state);
	const graphicsLevel = selectGraphicsQuality(state);

	const [closeLimit, farLimit] = calculateVisibleRange(cursorPositionInBeats ?? 0, beatDepth, graphicsLevel);

	const entityTime = resolveBeatForItem(earliestEntity);

	const isEntityVisible = entityTime > closeLimit && entityTime < farLimit;

	if (!isEntityVisible) {
		api.dispatch(actions.jumpToBeat({ beatNum: entityTime, pauseTrack: true, animateJump: true }));
	}
}

function switchEventPagesIfNecessary(api: MiddlewareAPI, args: { [K in "events"]: { past: BeatmapEntities[K]; future: BeatmapEntities[K] } }) {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const relevantEvents = findUniquesWithinArrays(args.events.past, args.events.future);

	if (relevantEvents.length === 0) {
		return;
	}

	const { startBeat, endBeat } = selectEventEditorStartAndEndBeat(state, songId);

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
			const pastNotes = selectPastColorNotes(state);
			const presentNotes = selectAllColorNotes(state);
			const pastBombs = selectPastBombNotes(state);
			const presentBombs = selectAllBombNotes(state);
			const pastObstacles = selectPastObstacles(state);
			const presentObstacles = selectAllObstacles(state);
			if (!pastNotes.length) return;
			jumpToEarliestNote(api, {
				notes: { past: pastNotes, future: presentNotes },
				bombs: { past: pastBombs, future: presentBombs },
				obstacles: { past: pastObstacles, future: presentObstacles },
			});
		},
	});
	instance.startListening({
		actionCreator: actions.redoNotes,
		effect: (_, api) => {
			const state = api.getState();
			const presentNotes = selectAllColorNotes(state);
			const futureNotes = selectFutureColorNotes(state);
			const presentBombs = selectAllBombNotes(state);
			const futureBombs = selectFutureBombNotes(state);
			const presentObstacles = selectAllObstacles(state);
			const futureObstacles = selectFutureObstacles(state);
			if (!futureNotes.length) return;
			jumpToEarliestNote(api, {
				notes: { past: presentNotes, future: futureNotes },
				bombs: { past: presentBombs, future: futureBombs },
				obstacles: { past: presentObstacles, future: futureObstacles },
			});
		},
	});
	instance.startListening({
		actionCreator: actions.undoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const pastEvents = selectPastBasicEvents(state);
			const presentEvents = selectAllBasicEvents(state);
			if (pastEvents === null) return;
			switchEventPagesIfNecessary(api, {
				events: { past: pastEvents, future: presentEvents },
			});
		},
	});
	instance.startListening({
		actionCreator: actions.redoEvents,
		effect: (_, api) => {
			const state = api.getState();
			const presentEvents = selectAllBasicEvents(state);
			const futureEvents = selectFutureBasicEvents(state);
			if (futureEvents === null) return;
			switchEventPagesIfNecessary(api, {
				events: { past: presentEvents, future: futureEvents },
			});
		},
	});

	return instance.middleware;
}
