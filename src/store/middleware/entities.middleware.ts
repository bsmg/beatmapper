import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import {
	copySelection,
	cutSelection,
	deselectAllEntities,
	mirrorAllSelectedObjects,
	mirrorSelection,
	nudgeAllSelectedEvents,
	nudgeAllSelectedObjects,
	nudgeSelection,
	pasteSelection,
	removeAllSelectedEvents,
	removeAllSelectedObjects,
	selectAllEntities,
	selectAllEntitiesInRange,
	setClipboardData,
	toggleSelectAllEntities,
	upsertEvents,
	upsertObjects,
} from "$/store/actions";
import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import { selectAnySelectedEvents, selectAnySelectedObjects, selectClipboardData, selectCursorPositionInBeats, selectEarliestBeat, selectEventEditorStartAndEndBeat, selectEventsEditorCursor, selectGridSize, selectSelectedBeatmapEntities, selectSnap } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { View } from "$/types";

interface Options {
	extra: Pick<AppExtraArgs, "getRouter">;
}

export default function createEntitiesMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: toggleSelectAllEntities,
		effect: (_, api) => {
			const view = selectActiveView(api.extra.getRouter());
			const isAnythingSelected = (view === View.LIGHTSHOW ? selectAnySelectedEvents : selectAnySelectedObjects)(api.getState());

			if (isAnythingSelected) {
				api.dispatch(deselectAllEntities());
			} else {
				switch (view) {
					case View.LIGHTSHOW: {
						const songId = selectActiveSongId(api.extra.getRouter());
						const { startBeat, endBeat } = selectEventEditorStartAndEndBeat(api.getState(), songId);
						api.dispatch(selectAllEntitiesInRange({ startBeat, endBeat }));
						break;
					}
					default: {
						api.dispatch(selectAllEntities());
						break;
					}
				}
			}
		},
	});
	instance.startListening({
		actionCreator: mirrorSelection,
		effect: (action, api) => {
			const songId = selectActiveSongId(api.extra.getRouter());
			const view = selectActiveView(api.extra.getRouter());

			switch (view) {
				case View.BEATMAP: {
					const grid = selectGridSize(api.getState(), songId);
					api.dispatch(mirrorAllSelectedObjects({ ...action.payload, grid }));
					break;
				}
			}
		},
	});
	instance.startListening({
		actionCreator: nudgeSelection,
		effect: (action, api) => {
			const view = selectActiveView(api.extra.getRouter());
			const snapTo = selectSnap(api.getState());

			switch (view) {
				case View.BEATMAP: {
					api.dispatch(nudgeAllSelectedObjects({ ...action.payload, amount: snapTo }));
					break;
				}
				case View.LIGHTSHOW: {
					api.dispatch(nudgeAllSelectedEvents({ ...action.payload, amount: snapTo }));
					break;
				}
			}
		},
	});
	instance.startListening({
		matcher: isAnyOf(cutSelection, copySelection),
		effect: (_, api) => {
			const state = api.getState();
			const view = selectActiveView(api.extra.getRouter());

			api.dispatch(setClipboardData({ data: selectSelectedBeatmapEntities(state, view) }));

			switch (view) {
				case View.BEATMAP: {
					api.dispatch(removeAllSelectedObjects());
					break;
				}
				case View.LIGHTSHOW: {
					api.dispatch(removeAllSelectedEvents());
				}
			}
		},
	});
	instance.startListening({
		actionCreator: pasteSelection,
		effect: (_, api) => {
			const state = api.getState();
			const view = selectActiveView(api.extra.getRouter());

			// when we're pasting, we need to deselect all currently selected entities
			if (selectAnySelectedObjects(state) || selectAnySelectedEvents(state)) {
				api.dispatch(deselectAllEntities({ view: view }));
			}

			const data = selectClipboardData(state);
			const earliestBeat = selectEarliestBeat(state);
			// When pasting in notes view, we want to paste at the cursor position, where the song is currently playing.
			// For the events view, we want to paste it where the mouse cursor is, the selected beat.
			switch (view) {
				case View.BEATMAP: {
					const songId = selectActiveSongId(api.extra.getRouter());
					const pasteAtBeat = selectCursorPositionInBeats(state, songId);
					const deltaBetweenPeriods = pasteAtBeat - earliestBeat;

					api.dispatch(
						upsertObjects({
							notes: data.notes?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
							bombs: data.bombs?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
							obstacles: data.obstacles?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
						}),
					);
					break;
				}
				case View.LIGHTSHOW: {
					const songId = selectActiveSongId(api.extra.getRouter());
					const pasteAtBeat = selectEventsEditorCursor(state) ?? selectCursorPositionInBeats(state, songId);
					const deltaBetweenPeriods = pasteAtBeat - earliestBeat;

					api.dispatch(
						upsertEvents({
							basicEvents: data.basicEvents?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
							boostEvents: data.boostEvents?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
						}),
					);
					break;
				}
			}
		},
	});

	return instance.middleware;
}
