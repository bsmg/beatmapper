import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { BeatmapFileType, ISaveOptions } from "bsmap/types";

import { HIGHEST_PRECISION } from "$/constants";
import type { resolveEventId } from "$/helpers/events.helpers";
import { resolveTimeForItem } from "$/helpers/item.helpers";
import type { resolveNoteId } from "$/helpers/notes.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { type App, type BeatmapId, type IEventTracks, type IGrid, type IGridPresets, type ISelectionBoxInBeats, type Member, type ObjectSelectionMode, type ObjectTool, type ObjectType, type SongId, View } from "$/types";
import { roundToNearest } from "$/utils";
import type { JsonWaveformData } from "waveform-data";
import { createEntityStorageActions, createStorageActions } from "./middleware/storage.middleware";
import {
	selectAllBasicEvents,
	selectAllBombNotes,
	selectAllColorNotes,
	selectAllNotes,
	selectAllObstacles,
	selectClipboardData,
	selectCursorPositionInBeats,
	selectDurationInBeats,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorCursor,
	selectNotesEditorDirection,
	selectNotesEditorTool,
	selectPlaying,
	selectSnap,
} from "./selectors";
import type { RootState, SessionStorageObservers, UserStorageObservers } from "./setup";

import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import notes from "./features/entities/beatmap/notes.slice";
import obstacles from "./features/entities/beatmap/obstacles.slice";
import bookmarks from "./features/entities/editor/bookmarks.slice";
import basicEvents from "./features/entities/lightshow/basic.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";

export const { init } = global.actions;

export const { load: loadUser, save: saveUser, hydrate: hydrateUser } = createStorageActions<RootState, UserStorageObservers>("user");
export const { load: loadSession, save: saveSession, hydrate: hydrateSession } = createStorageActions<RootState, SessionStorageObservers>("session");
export const { load: loadSongs, save: saveSongs, hydrate: hydrateSongs } = createEntityStorageActions<App.ISong>("songs");
export const { load: loadGridPresets, save: saveGridPresets, hydrate: hydrateGridPresets } = createEntityStorageActions<Member<IGridPresets>>("grids");

export const rehydrate = createAction("@@STORAGE/rehydrate");

export const { dismissPrompt, updateUsername, updateProcessingDelay, updateRenderScale, updateBloomEnabled, updatePacerWait } = user.actions;

export const startLoadingMap = createAction("startLoadingMap", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args } };
});

export const finishLoadingMap = createAction("finishLoadingMap", (args: { songId: SongId; songData: App.ISong; duration: number; waveformData: JsonWaveformData }) => {
	return { payload: { ...args, songData: { ...args.songData, lastOpenedAt: Date.now() } } };
});

export const loadBeatmapEntities = createAction("loadBeatmapContents", (args: Partial<App.IBeatmapEntities>) => {
	return { payload: { ...args } };
});

export const downloadMapFiles = createAction("downloadMap", (args: { songId: SongId; version?: ImplicitVersion; options?: Omit<ISaveOptions<BeatmapFileType, 1 | 2 | 3 | 4>, "preprocess" | "postprocess"> }) => {
	return { payload: { ...args } };
});

export const leaveEditor = createAction("leaveEditor", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args } };
});

export const { addOne: addSong, addOneFromFile: addSongFromFile, updateOne: updateSong, updateSelectedBeatmap, removeOne: removeSong, addBeatmap, cloneBeatmap: copyBeatmap, updateBeatmap, removeBeatmap, updateModuleEnabled, updateCustomColor, updateGridSize } = songs.actions;

export const loadDemoMap = createAction("loadDemoMap");

export const {
	startPlayback,
	pausePlayback,
	stopPlayback,
	jumpToBeat,
	jumpToStart,
	jumpToEnd,
	jumpForwards: seekForwards,
	jumpBackwards: seekBackwards,
	updateCursorPosition,
	updateTrackScale: updateBeatDepth,
	updatePlaybackRate,
	updateSongVolume,
	updateTickVolume,
	updateTickType,
	updateSnap,
	incrementSnap,
	decrementSnap,
} = navigation.actions;

export const reloadVisualizer = createAction("reloadVisualizer", (args: { duration: number; waveformData: JsonWaveformData }) => {
	return { payload: { ...args } };
});

export const togglePlaying = createAction("togglePlaying", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const tick = createAction("tick", (args: { timeElapsed: number }) => {
	return { payload: { ...args } };
});

export const addToCell = createAsyncThunk("addToCell", (args: { songId: SongId; posX: number; posY: number; direction?: number; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const selectedDirection = args.direction ?? selectNotesEditorDirection(state);
	const selectedTool = selectNotesEditorTool(state);
	const cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	const duration = selectDurationInBeats(state, args.songId);
	if (cursorPositionInBeats < 0 || (duration && cursorPositionInBeats > duration)) return api.rejectWithValue("Cannot place objects out-of-bounds.");

	function adjustNoteCursorPosition(cursorPositionInBeats: number, state: RootState) {
		const isPlaying = selectPlaying(state);

		if (isPlaying) {
			// If the user tries to place blocks while the song is playing, we want to snap to the nearest snapping interval.
			// eg. if they're set to snap to 1/2 beats, and they click when the song is 3.476 beats in, we should round up to 3.5.
			const snapTo = selectSnap(state);
			return roundToNearest(cursorPositionInBeats, snapTo);
		}
		// If the song isn't playing, we want to snap to the highest precision we have.
		// Note that this will mean a slight tweak for notes that are a multiple of 3 (eg. a note at 1.333 beats will be rounded to 1.328125)
		return roundToNearest(cursorPositionInBeats, HIGHEST_PRECISION);
	}

	const adjustedCursorPosition = adjustNoteCursorPosition(cursorPositionInBeats, state);
	const alreadyExists = selectAllNotes(state).some((note) => note.time === adjustedCursorPosition && note.posX === args.posX && note.posY === args.posY);
	if (alreadyExists) api.dispatch(removeFromCell(args));
	return api.fulfillWithValue({ ...args, time: adjustedCursorPosition, direction: selectedDirection, tool: selectedTool });
});

export const removeFromCell = createAsyncThunk("removeFromCell", (args: { songId: SongId; posX: number; posY: number; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	return api.fulfillWithValue({ ...args, time: cursorPositionInBeats });
});

export const { updateZoom: zoomVisualizer } = visualizer.actions;

export const scrollThroughSong = createAction("scrollThroughSong", (args: { songId: SongId; direction: "forwards" | "backwards" }) => {
	return { payload: { ...args } };
});

export const scrubVisualizer = createAction("scrubVisualizer", (args: { songId: SongId; newOffset: number }) => {
	return { payload: { ...args } };
});

export const scrubEventsHeader = createAction("scrubEventsHeader", (args: { songId: SongId; selectedBeat: number }) => {
	return { payload: { ...args } };
});

export const { updateTool: updateNotesEditorTool, updateDirection: updateNotesEditorDirection, upsertGridPreset: saveGridPreset, removeGridPreset } = beatmap.actions;

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
	incrementZoom: incrementEventsEditorZoom,
	decrementZoom: decrementEventsEditorZoom,
	updatePreview: updateEventsEditorPreview,
	updateWindowLock: updateEventsEditorWindowLock,
	updateMirrorLock: updateEventsEditorMirrorLock,
} = lightshow.actions;

export const drawEventSelectionBox = createAsyncThunk("drawEventSelectionBox", (args: { songId: SongId; tracks: IEventTracks; selectionBoxInBeats: ISelectionBoxInBeats }, api) => {
	const state = api.getState() as RootState;
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

export const { updateOne: updateColorNote, mirrorOne: mirrorColorNote } = notes.actions;

export const selectNote = createAction("selectNote", (args: { query: Parameters<typeof resolveNoteId>[0] }) => {
	return { payload: { ...args } };
});

export const deselectNote = createAction("deselectNote", (args: { query: Parameters<typeof resolveNoteId>[0] }) => {
	return { payload: { ...args } };
});

export const removeNote = createAction("removeNote", (args: { query: Parameters<typeof resolveNoteId>[0] }) => {
	return { payload: { ...args } };
});

export const bulkRemoveNote = createAction("bulkRemoveNote", (args: { query: Parameters<typeof resolveNoteId>[0] }) => {
	return { payload: { ...args } };
});

export const removeAllSelectedObjects = createAction("removeAllSelectedObjects");

export const startManagingNoteSelection = createAction("startManagingNoteSelection", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});

export const finishManagingNoteSelection = createAction("finishManagingNoteSelection");

export const { addOne: addObstacle, updateOne: updateObstacle, selectOne: selectObstacle, deselectOne: deselectObstacle, updateAllSelected: updateAllSelectedObstacles, removeOne: removeObstacle } = obstacles.actions;

export const selectAllEntities = createAsyncThunk("selectAllEntities", (args: { songId: SongId; view: View }, api) => {
	const state = api.getState() as RootState;
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

export const toggleSelectAllEntities = createAsyncThunk("toggleSelectAllEntities", (args: { songId: SongId; view: View }, api) => {
	const state = api.getState() as RootState;

	let anythingSelected = false;

	if (args.view === View.BEATMAP) {
		const notes = selectAllColorNotes(state);
		const bombs = selectAllBombNotes(state);
		const obstacles = selectAllObstacles(state);
		anythingSelected = [...notes, ...bombs, ...obstacles].some((x) => !!x.selected);
	} else if (args.view === View.LIGHTSHOW) {
		const events = selectAllBasicEvents(state);
		anythingSelected = [...events].some((x) => x.selected);
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

export const selectAllEntitiesInRange = createAction("selectAllEntitiesInRange", (args: { songId: SongId; view: View; start: number; end: number }) => {
	return { payload: { ...args } };
});

export const mirrorSelection = createAction("mirrorSelection", (args: { axis: "horizontal" | "vertical" }) => {
	return { payload: { ...args } };
});

export const nudgeSelection = createAsyncThunk("nudgeSelection", (args: { direction: "forwards" | "backwards"; view: View }, api) => {
	const state = api.getState() as RootState;
	const snapTo = selectSnap(state);
	return api.fulfillWithValue({ ...args, amount: snapTo });
});

export const undoObjects = createAction("undoObjects", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const redoObjects = createAction("redoObjects", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const { addOne: addBasicEvent, addOne: bulkAddBasicEvent, updateOne: updateBasicEvent, updateColor: mirrorBasicEvent } = basicEvents.actions;

export const removeEvent = createAction("removeEvent", (args: { query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTracks; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const bulkRemoveEvent = createAction("bulkRemoveEvent", (args: { query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTracks; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const removeAllSelectedEvents = createAction("removeAllSelectedEvents");

export const undoEvents = createAction("undoEvents", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const redoEvents = createAction("redoEvents", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const { cutSelection, copySelection } = clipboard.actions;

export const pasteSelection = createAsyncThunk("pasteSelection", (args: { songId: SongId; view: View }, api) => {
	const state = api.getState() as RootState;
	const data = selectClipboardData(state);
	// If there's nothing copied, do nothing
	if (!data) return api.rejectWithValue("Clipboard is empty.");
	// When pasting in notes view, we want to paste at the cursor position, where the song is currently playing.
	// For the events view, we want to paste it where the mouse cursor is, the selected beat.
	const pasteAtBeat = args.view === View.BEATMAP ? selectCursorPositionInBeats(state, args.songId) : selectEventsEditorCursor(state);
	if (pasteAtBeat === null) return api.rejectWithValue("Invalid beat number.");
	const earliestBeat = [...(data.notes ?? []), ...(data.obstacles ?? []), ...(data.events ?? [])].map(resolveTimeForItem).sort((a, b) => a - b)[0];
	const deltaBetweenPeriods = pasteAtBeat - earliestBeat;
	// Every entity that has an ID (obstacles, events) needs a unique ID, we shouldn't blindly copy it over.
	return api.fulfillWithValue({ ...args, data: data, deltaBetweenPeriods });
});

export const { addOne: addBookmark, removeOne: removeBookmark } = bookmarks.actions;
