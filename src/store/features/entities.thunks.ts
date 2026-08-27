import { deselectAllEntities, mirrorAllSelectedObjects, nudgeAllSelectedEvents, nudgeAllSelectedObjects, removeAllSelectedEvents, removeAllSelectedObjects, selectAllEntities, selectAllEntitiesInRange, setClipboardData, upsertEvents, upsertObjects } from "$/store/actions";
import { selectActiveSongId, selectActiveView } from "$/store/helpers/route.helpers";
import { selectAnySelectedEvents, selectAnySelectedObjects, selectClipboardData, selectCursorPositionInBeats, selectEarliestBeat, selectEventsEditorCursor, selectEventsEditorStartAndEndBeat, selectGridSize, selectSelectedBeatmapEntities, selectSnap } from "$/store/selectors";
import type { AppThunkApiConfig } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import { View } from "$/types";

export const toggleSelectAllEntities = createThunk("toggleSelectAllEntities", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const songId = selectActiveSongId(api.extra.getRouter());
	const view = selectActiveView(api.extra.getRouter());

	const isAnythingSelected = (view === View.LIGHTSHOW ? selectAnySelectedEvents : selectAnySelectedObjects)(api.getState());

	if (isAnythingSelected) {
		api.dispatch(deselectAllEntities());
	} else {
		switch (view) {
			case View.LIGHTSHOW: {
				const { startBeat, endBeat } = selectEventsEditorStartAndEndBeat(api.getState(), songId);
				return api.dispatch(selectAllEntitiesInRange({ startBeat, endBeat }));
			}
			default: {
				return api.dispatch(selectAllEntities());
			}
		}
	}
});

export const mirrorSelection = createThunk("mirrorSelection", (args: { axis: "horizontal" | "vertical" }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const songId = selectActiveSongId(api.extra.getRouter());
	const view = selectActiveView(api.extra.getRouter());

	switch (view) {
		case View.BEATMAP: {
			const grid = selectGridSize(api.getState(), songId);
			return api.dispatch(mirrorAllSelectedObjects({ ...args, grid }));
		}
	}
});
export const nudgeSelection = createThunk("nudgeSelection", (args: { direction: "forwards" | "backwards" }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const view = selectActiveView(api.extra.getRouter());
	const snapTo = selectSnap(api.getState());

	switch (view) {
		case View.BEATMAP: {
			return api.dispatch(nudgeAllSelectedObjects({ ...args, amount: snapTo }));
		}
		case View.LIGHTSHOW: {
			return api.dispatch(nudgeAllSelectedEvents({ ...args, amount: snapTo }));
		}
	}
});

export const cutSelection = createThunk("cutSelection", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const view = selectActiveView(api.extra.getRouter());

	api.dispatch(setClipboardData({ data: selectSelectedBeatmapEntities(api.getState(), view) }));

	switch (view) {
		case View.BEATMAP: {
			return api.dispatch(removeAllSelectedObjects());
		}
		case View.LIGHTSHOW: {
			return api.dispatch(removeAllSelectedEvents());
		}
	}
});
export const copySelection = createThunk("copySelection", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const view = selectActiveView(api.extra.getRouter());

	api.dispatch(setClipboardData({ data: selectSelectedBeatmapEntities(api.getState(), view) }));
});
export const pasteSelection = createThunk("pasteSelection", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	const state = api.getState();
	const view = selectActiveView(api.extra.getRouter());

	// when we're pasting, we need to deselect all currently selected entities
	if (selectAnySelectedObjects(state) || selectAnySelectedEvents(state)) {
		api.dispatch(deselectAllEntities({ view: view }));
	}

	const data = selectClipboardData(state);
	const earliestBeat = selectEarliestBeat(state);

	switch (view) {
		case View.BEATMAP: {
			const songId = selectActiveSongId(api.extra.getRouter());
			const pasteAtBeat = selectCursorPositionInBeats(state, songId);
			const deltaBetweenPeriods = pasteAtBeat - earliestBeat;

			return api.dispatch(
				upsertObjects({
					notes: data.notes?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
					bombs: data.bombs?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
					obstacles: data.obstacles?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
				}),
			);
		}
		case View.LIGHTSHOW: {
			const songId = selectActiveSongId(api.extra.getRouter());
			const pasteAtBeat = selectEventsEditorCursor(state) ?? selectCursorPositionInBeats(state, songId);
			const deltaBetweenPeriods = pasteAtBeat - earliestBeat;

			return api.dispatch(
				upsertEvents({
					basicEvents: data.basicEvents?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
					boostEvents: data.boostEvents?.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
				}),
			);
		}
	}
});
