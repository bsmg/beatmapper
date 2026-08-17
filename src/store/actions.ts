import { createAction } from "@reduxjs/toolkit";
import type { ITrackDefinitions } from "bsmap";

import type { ExportMapArchiveOptions } from "$/services/packaging.service";
import type { App, BeatmapId, ISelectionBoxInBeats, ObjectSelectionMode, ObjectType, SongId } from "$/types";
import { selectActiveView } from "./helpers/route.helpers";
import type { AppThunkApiConfig } from "./types";
import { createThunk, type GetShallowThunkAPI } from "./utils/thunk.utils";

// biome-ignore-start assist/source/organizeImports: circular dependencies

import beatmap from "./features/beatmap.slice";
import bookmarks from "./features/bookmarks.slice";
import clipboard from "./features/clipboard.slice";
import events from "./features/events.slice";
import global from "./features/global.slice";
import lightshow from "./features/lightshow.slice";
import navigation from "./features/navigation.slice";
import objects from "./features/objects.slice";
import songs from "./features/songs.slice";
import timeline from "./features/timeline.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";

// biome-ignore-end assist/source/organizeImports: circular dependencies

export const { init } = global.actions;

export const rehydrate = createAction("rehydrate", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args }, meta: { hydrate: true, sync: true } };
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
	upsertMany: upsertSongs,
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

export const incrementSnap = createAction("incrementSnap");
export const decrementSnap = createAction("decrementSnap");

export const incrementPlaybackRate = createAction("incrementPlaybackRate");
export const decrementPlaybackRate = createAction("decrementPlaybackRate");

export const incrementSongVolume = createAction("incrementSongVolume");
export const decrementSongVolume = createAction("decrementSongVolume");

export const incrementTickVolume = createAction("incrementTickVolume");
export const decrementTickVolume = createAction("decrementTickVolume");

export const { reloadVisualizer, updateZoom: zoomVisualizer } = visualizer.actions;

export const { updateTool: updateNotesEditorTool, updateDirection: updateNotesEditorDirection, updateDefaultObstacleDuration: updateNotesEditorDefaultObstacleDuration, hydrateGridPresets, upsertGridPreset, removeGridPreset } = beatmap.actions;

export const loadGridPreset = createAction("loadGridPreset", (args: { slot: string }) => {
	return { payload: { ...args } };
});
export const saveGridPreset = createAction("saveGridPreset", (args: { slot: string }) => {
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

export const incrementEventsEditorZoomLevel = createAction("incrementZoomLevel");
export const decrementEventsEditorZoomLevel = createAction("decrementZoomLevel");

export const drawEventSelectionBox = createAction("drawEventSelectionBox", (args: { window: { startBeat: number; endBeat: number }; tracks: ITrackDefinitions<unknown>; selectionBoxInBeats: ISelectionBoxInBeats }) => {
	return { payload: { ...args } };
});

export const cycleToNextTool = createThunk("cycleToNextTool", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
export const cycleToPrevTool = createThunk("cycleToPrevTool", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});

export const { undo: undoObjects, redo: redoObjects, clearHistory: clearObjectHistory, upsertObjects, mirrorAllSelectedObjects, nudgeAllSelectedObjects, removeAllSelectedObjects } = objects.actions;
export const { addColorNote, updateColorNote, selectColorNote, deselectColorNote, removeColorNote } = objects.actions;
export const { addBombNote, selectBombNote, deselectBombNote, removeBombNote } = objects.actions;
export const { addObstacle, updateObstacle, selectObstacle, deselectObstacle, updateAllSelectedObstacles, removeObstacle } = objects.actions;

export const startManagingNoteSelection = createAction("startManagingNoteSelection", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});

export const finishManagingNoteSelection = createAction("finishManagingNoteSelection");

export const { undo: undoEvents, redo: redoEvents, clearHistory: clearEventHistory, upsertEvents, nudgeAllSelectedEvents, removeAllSelectedEvents } = events.actions;
export const { addBasicEvent, updateBasicEvent, selectBasicEvent, deselectBasicEvent, removeBasicEvent } = events.actions;
export const { addBoostEvent, updateBoostEvent, selectBoostEvent, deselectBoostEvent, removeBoostEvent } = events.actions;

export const selectAllEntities = createThunk("selectAllEntities", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
export const selectAllEntitiesInRange = createThunk("selectAllEntitiesInRange", (args: { startBeat: number; endBeat: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { ...args, view: selectActiveView(api.extra.getRouter()) };
});

export const deselectAllEntities = createThunk("deselectAllEntities", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
export const deselectAllEntitiesOfType = createThunk("deselectAllEntitiesOfType", (args: { itemType: ObjectType }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { ...args, view: selectActiveView(api.extra.getRouter()) };
});

export const toggleSelectAllEntities = createAction("toggleSelectAllEntities");

export const mirrorSelection = createAction("mirrorSelection", (args: { axis: "horizontal" | "vertical" }) => {
	return { payload: { ...args } };
});
export const nudgeSelection = createAction("nudgeSelection", (args: { direction: "forwards" | "backwards" }) => {
	return { payload: { ...args } };
});

export const { setData: setClipboardData } = clipboard.actions;

export const cutSelection = createAction("cutSelection");
export const copySelection = createAction("copySelection");
export const pasteSelection = createAction("pasteSelection");

export const { addOne: addBookmark, removeOne: removeBookmark } = bookmarks.actions;
