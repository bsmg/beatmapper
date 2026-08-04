import { createAction, createAsyncThunk, type GetThunkAPI } from "@reduxjs/toolkit";
import type { ITrackDefinitions } from "bsmap";

import { SNAPPING_INCREMENT_VALUES, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import type { ExportMapArchiveOptions } from "$/services/packaging.service";
import { type App, type BeatmapId, type IGrid, type ISelectionBoxInBeats, type ObjectSelectionMode, type ObjectType, type SongId, View } from "$/types";
import {
	selectAllBasicEvents,
	selectAllBombNotes,
	selectAllColorNotes,
	selectAllObstacles,
	selectAnySelectedEvents,
	selectAnySelectedObjects,
	selectClipboardData,
	selectCursorPositionInBeats,
	selectEarliestBeat,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorCursor,
	selectEventsEditorZoomLevel,
	selectPlaybackRate,
	selectSnap,
	selectSongVolume,
	selectTickVolume,
} from "./selectors";
import type { AppThunkApiConfig } from "./setup";
import { createIncrementByIndexPayloadActionCreator, createIncrementByValuePayloadActionCreator, createThunk, type GetShallowThunkAPI } from "./utils";

// biome-ignore-start assist/source/organizeImports: circular dependencies

import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import bookmarks from "./features/entities/editor/bookmarks.slice";
import events from "./features/entities/events.slice";
import objects from "./features/entities/objects.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import timeline from "./features/timeline.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";

// biome-ignore-end assist/source/organizeImports: circular dependencies

export const { init } = global.actions;

export const rehydrate = createAction("rehydrate", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args }, meta: { hydrate: true } };
});

export const { updateNew, updateAnnouncements, updateUsername, updateRenderScale, updateBloomEnabled, updateObstaclePlacementMode, updatePacerWait } = user.actions;

export const startLoadingMap = createAction("startLoadingMap", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args } };
});

export const finishLoadingMap = createAction("finishLoadingMap", (args: { songId: SongId; songData: App.ISong }) => {
	return { payload: { ...args, songData: { ...args.songData, lastOpenedAt: Date.now() } } };
});

export const loadBeatmapEntities = createAction("loadBeatmapContents", (args: Partial<App.IBeatmapEntities>) => {
	return { payload: { ...args } };
});

export const saveBeatmapContents = createAction("saveBeatmapContents", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const downloadMapFiles = createAction("downloadMap", (args: { songId: SongId } & ExportMapArchiveOptions) => {
	return { payload: { ...args } };
});

export const leaveEditor = createAction("leaveEditor", (args: { songId: SongId; beatmapId: BeatmapId; entities: Partial<App.IBeatmapEntities> }) => {
	return { payload: { ...args } };
});

export const {
	hydrate: hydrateSongs,
	addOne: addSong,
	addOneFromFile: addSongFromFile,
	updateOne: updateSong,
	updateSelectedBeatmap,
	removeOne: removeSong,
	addBeatmap,
	cloneBeatmap: copyBeatmap,
	updateBeatmap,
	removeBeatmap,
	addColorScheme,
	updateColorScheme,
	removeColorScheme,
	updateModuleEnabled,
	updateCustomColors,
	updateGridSize,
} = songs.actions;

export const loadDemoMap = createAction("loadDemoMap");

export const { updateTimescale } = timeline.actions;

export const {
	updateCursorPosition,
	tick,
	startPlayback,
	pausePlayback,
	stopPlayback,
	togglePlayback,
	jumpToBeat,
	jumpToTime,
	jumpToStart,
	jumpToEnd,
	jumpForwards: seekForwards,
	jumpBackwards: seekBackwards,
	scrollThroughSong,
	updateTrackScale,
	updatePlaybackRate,
	updateSongVolume,
	updateTickVolume,
	updateTickType,
	updateSnap,
} = navigation.actions;

const createIncrementSnap = createIncrementByIndexPayloadActionCreator(SNAPPING_INCREMENT_VALUES, {
	select: selectSnap,
	update: updateSnap,
});
export const incrementSnap = createThunk("incrementSnap", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementSnap({ delta: 1 }, api);
});
export const decrementSnap = createThunk("decrementSnap", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementSnap({ delta: -1 }, api);
});

const createIncrementPlaybackRate = createIncrementByValuePayloadActionCreator([0, 2], {
	select: selectPlaybackRate,
	update: updatePlaybackRate,
});
export const incrementPlaybackRate = createThunk("incrementPlaybackRate", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementPlaybackRate({ delta: 0.25 }, api);
});
export const decrementPlaybackRate = createThunk("decrementPlaybackRate", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementPlaybackRate({ delta: -0.25 }, api);
});

const createIncrementSongVolume = createIncrementByValuePayloadActionCreator([0, 1], {
	select: selectSongVolume,
	update: updateSongVolume,
});
export const incrementSongVolume = createThunk("incrementSongVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementSongVolume({ delta: 0.125 }, api);
});
export const decrementSongVolume = createThunk("decrementSongVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementSongVolume({ delta: -0.125 }, api);
});

const createIncrementTickVolume = createIncrementByValuePayloadActionCreator([0, 1], {
	select: selectTickVolume,
	update: updateTickVolume,
});
export const incrementTickVolume = createThunk("incrementTickVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementTickVolume({ delta: 0.125 }, api);
});
export const decrementTickVolume = createThunk("decrementTickVolume", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementTickVolume({ delta: -0.125 }, api);
});

export const { reloadVisualizer, updateZoom: zoomVisualizer } = visualizer.actions;

export const { updateTool: updateNotesEditorTool, updateDirection: updateNotesEditorDirection, updateDefaultObstacleDuration: updateNotesEditorDefaultObstacleDuration, hydrateGridPresets, upsertGridPreset: saveGridPreset, removeGridPreset } = beatmap.actions;

export const loadGridPreset = createAction("loadGridPreset", (args: { songId: SongId; grid: IGrid }) => {
	return { payload: { ...args } };
});

export const {
	updateTool: updateEventsEditorTool,
	updateColor: updateEventsEditorColor,
	updateEditMode: updateEventsEditorEditMode,
	updateCursor: updateEventsEditorCursor,
	updateTrackHeight: updateEventsEditorTrackHeight,
	updateTrackOpacity: updateEventsEditorTrackOpacity,
	updateZoomLevel: updateEventsEditorZoomLevel,
	updatePreview: updateEventsEditorPreview,
	updateWindowLock: updateEventsEditorWindowLock,
	updateMirrorLock: updateEventsEditorMirrorLock,
} = lightshow.actions;

const createIncrementZoomLevel = createIncrementByValuePayloadActionCreator([ZOOM_LEVEL_MIN, ZOOM_LEVEL_MAX], {
	select: selectEventsEditorZoomLevel,
	update: updateEventsEditorZoomLevel,
});
export const incrementEventsEditorZoomLevel = createThunk("incrementZoomLevel", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementZoomLevel({ delta: 1 }, api);
});
export const decrementEventsEditorZoomLevel = createThunk("decrementZoomLevel", (_, api: GetShallowThunkAPI<AppThunkApiConfig>) => {
	return createIncrementZoomLevel({ delta: -1 }, api);
});

export const drawEventSelectionBox = createAsyncThunk("drawEventSelectionBox", (args: { songId: SongId; tracks: ITrackDefinitions<unknown>; selectionBoxInBeats: ISelectionBoxInBeats }, api: GetThunkAPI<AppThunkApiConfig>) => {
	const state = api.getState();
	const { startBeat, endBeat } = selectEventEditorStartAndEndBeat(state, args.songId);
	const metadata = { window: { startBeat, endBeat } };
	return api.fulfillWithValue({ ...args, metadata });
});

export const cycleToNextTool = createAction("cycleToNextTool", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const cycleToPrevTool = createAction("cycleToPrevTool", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const { undo: undoObjects, redo: redoObjects, clearHistory: clearObjectHistory, removeAllSelectedObjects } = objects.actions;
export const { addColorNote, updateColorNote, selectColorNote, deselectColorNote, removeColorNote } = objects.actions;
export const { addBombNote, selectBombNote, deselectBombNote, removeBombNote } = objects.actions;
export const { addObstacle, updateObstacle, selectObstacle, deselectObstacle, updateAllSelectedObstacles, removeObstacle } = objects.actions;

export const startManagingNoteSelection = createAction("startManagingNoteSelection", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});

export const finishManagingNoteSelection = createAction("finishManagingNoteSelection");

export const { undo: undoEvents, redo: redoEvents, clearHistory: clearEventHistory, removeAllSelectedEvents } = events.actions;
export const { addBasicEvent, updateBasicEvent, selectBasicEvent, deselectBasicEvent, removeBasicEvent } = events.actions;
export const { addBoostEvent, updateBoostEvent, selectBoostEvent, deselectBoostEvent, removeBoostEvent } = events.actions;

export const selectAllEntities = createAsyncThunk("selectAllEntities", (args: { songId: SongId; view: View }, api: GetThunkAPI<AppThunkApiConfig>) => {
	const state = api.getState();
	// For the events view, we don't actually want to select EVERY note. We only want to select what is visible in the current frame.
	let metadata = null;
	if (args.view === View.LIGHTSHOW) {
		const { startBeat, endBeat } = selectEventEditorStartAndEndBeat(state, args.songId);
		metadata = { startBeat, endBeat };
	}
	return api.fulfillWithValue({ ...args, metadata });
});

export const deselectAllEntities = createAction("deselectAllEntities", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const toggleSelectAllEntities = createAsyncThunk("toggleSelectAllEntities", (args: { songId: SongId; view: View }, api: GetThunkAPI<AppThunkApiConfig>) => {
	const state = api.getState();

	let anythingSelected = false;

	if (args.view === View.BEATMAP) {
		const notes = selectAllColorNotes(state);
		const bombs = selectAllBombNotes(state);
		const obstacles = selectAllObstacles(state);
		anythingSelected = [...notes, ...bombs, ...obstacles].some((x) => !!x.selected);
	} else if (args.view === View.LIGHTSHOW) {
		const basicEvents = selectAllBasicEvents(state);
		anythingSelected = [...basicEvents].some((x) => x.selected);
	}

	if (anythingSelected) {
		api.dispatch(deselectAllEntities({ view: args.view }));
	} else {
		api.dispatch(selectAllEntities({ songId: args.songId, view: args.view }));
	}
});

export const deselectAllEntitiesOfType = createAction("deselectAllEntitiesOfType", (args: { itemType: ObjectType }) => {
	return { payload: { ...args } };
});

export const selectAllEntitiesInRange = createAction("selectAllEntitiesInRange", (args: { songId: SongId; view: View; startBeat: number; endBeat: number }) => {
	return { payload: { ...args } };
});

export const mirrorSelection = createAction("mirrorSelection", (args: { axis: "horizontal" | "vertical"; grid?: IGrid }) => {
	return { payload: { ...args } };
});

export const nudgeSelection = createAsyncThunk("nudgeSelection", (args: { direction: "forwards" | "backwards"; view: View }, api: GetThunkAPI<AppThunkApiConfig>) => {
	const state = api.getState();
	const snapTo = selectSnap(state);
	return api.fulfillWithValue({ ...args, amount: snapTo });
});

export const { cutSelection, copySelection } = clipboard.actions;

export const pasteSelection = createAsyncThunk("pasteSelection", (args: { songId: SongId; view: View }, api: GetThunkAPI<AppThunkApiConfig>) => {
	const state = api.getState();
	const data = selectClipboardData(state);
	// If there's nothing copied, do nothing
	if (!data) return api.rejectWithValue("Clipboard is empty.");
	// when we're pasting, we need to deselect all currently selected entities
	if (selectAnySelectedObjects(state) || selectAnySelectedEvents(state)) {
		api.dispatch(deselectAllEntities({ view: args.view }));
	}
	// When pasting in notes view, we want to paste at the cursor position, where the song is currently playing.
	// For the events view, we want to paste it where the mouse cursor is, the selected beat.
	const pasteAtBeat = args.view === View.BEATMAP ? selectCursorPositionInBeats(state, args.songId) : selectEventsEditorCursor(state);
	if (pasteAtBeat === null) return api.rejectWithValue("Invalid beat number.");
	const earliestBeat = selectEarliestBeat(state);
	const deltaBetweenPeriods = pasteAtBeat - earliestBeat;
	// Every entity that has an ID (obstacles, events) needs a unique ID, we shouldn't blindly copy it over.
	return api.fulfillWithValue({ ...args, data: data, deltaBetweenPeriods });
});

export const { addOne: addBookmark, removeOne: removeBookmark } = bookmarks.actions;
