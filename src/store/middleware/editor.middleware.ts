import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { SNAPPING_INCREMENT_VALUES, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants/editor.constants";
import {
	decrementEventsEditorZoomLevel,
	decrementPlaybackRate,
	decrementSnap,
	decrementSongVolume,
	decrementTickVolume,
	incrementEventsEditorZoomLevel,
	incrementPlaybackRate,
	incrementSnap,
	incrementSongVolume,
	incrementTickVolume,
	loadGridPreset,
	saveGridPreset,
	updateEventsEditorZoomLevel,
	updateGridSize,
	updatePlaybackRate,
	updateSnap,
	updateSongVolume,
	updateTickVolume,
	upsertGridPreset,
} from "$/store/actions";
import { selectActiveSongId } from "$/store/helpers/route.helpers";
import { selectEventsEditorZoomLevel, selectGridPresetById, selectGridSize, selectPlaybackRate, selectSnap, selectSongVolume, selectTickVolume } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { createIncrementByIndexPayloadActionCreator, createIncrementByValuePayloadActionCreator } from "$/store/utils/thunk.utils";

interface Options {
	extra: Pick<AppExtraArgs, "getRouter">;
}

export default function createEditorMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		matcher: isAnyOf(incrementSnap, decrementSnap),
		effect: (action, api) => {
			return createIncrementByIndexPayloadActionCreator(SNAPPING_INCREMENT_VALUES, selectSnap, updateSnap)({ delta: incrementSnap.match(action) ? 1 : -1 }, api);
		},
	});
	instance.startListening({
		matcher: isAnyOf(incrementPlaybackRate, decrementPlaybackRate),
		effect: (action, api) => {
			return createIncrementByValuePayloadActionCreator([0, 2], selectPlaybackRate, updatePlaybackRate)({ delta: incrementPlaybackRate.match(action) ? 0.25 : -0.25 }, api);
		},
	});
	instance.startListening({
		matcher: isAnyOf(incrementSongVolume, decrementSongVolume),
		effect: (action, api) => {
			return createIncrementByValuePayloadActionCreator([0, 1], selectSongVolume, updateSongVolume)({ delta: incrementSongVolume.match(action) ? 0.125 : -0.125 }, api);
		},
	});
	instance.startListening({
		matcher: isAnyOf(incrementTickVolume, decrementTickVolume),
		effect: (action, api) => {
			return createIncrementByValuePayloadActionCreator([0, 1], selectTickVolume, updateTickVolume)({ delta: incrementPlaybackRate.match(action) ? 0.125 : -0.125 }, api);
		},
	});

	instance.startListening({
		actionCreator: loadGridPreset,
		effect: (action, api) => {
			const songId = selectActiveSongId(api.extra.getRouter());
			const gridFromPreset = selectGridPresetById(api.getState(), action.payload.slot);
			api.dispatch(updateGridSize({ songId, changes: gridFromPreset }));
		},
	});
	instance.startListening({
		actionCreator: saveGridPreset,
		effect: (action, api) => {
			const songId = selectActiveSongId(api.extra.getRouter());
			const state = api.getState();
			const grid = selectGridSize(state, songId);
			api.dispatch(upsertGridPreset({ ...action.payload, grid }));
		},
	});

	instance.startListening({
		matcher: isAnyOf(incrementEventsEditorZoomLevel, decrementEventsEditorZoomLevel),
		effect: (action, api) => {
			return createIncrementByValuePayloadActionCreator([ZOOM_LEVEL_MIN, ZOOM_LEVEL_MAX], selectEventsEditorZoomLevel, updateEventsEditorZoomLevel)({ delta: incrementEventsEditorZoomLevel.match(action) ? 1 : -1 }, api);
		},
	});

	return instance.middleware;
}
