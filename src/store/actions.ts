import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { EnvironmentName, ITrackDefinitions } from "bsmap";

import { HIGHEST_PRECISION } from "$/constants";
import type { resolveEventId } from "$/helpers/events.helpers";
import type { resolveNoteId } from "$/helpers/notes.helpers";
import type { ExportMapArchiveOptions } from "$/services/packaging.service";
import { type App, type BeatmapId, type IGrid, type ISelectionBoxInBeats, type ObjectSelectionMode, type ObjectTool, type ObjectType, type SongId, View } from "$/types";
import { roundToNearest } from "$/utils";
import {
	selectAllBasicEvents,
	selectAllBombNotes,
	selectAllColorNotes,
	selectAllNotes,
	selectAllObstacles,
	selectClipboardData,
	selectCursorPositionInBeats,
	selectDurationInBeats,
	selectEarliestBeat,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorCursor,
	selectNotesEditorDirection,
	selectNotesEditorTool,
	selectPlaying,
	selectSnap,
} from "./selectors";
import type { RootState } from "./setup";

// biome-ignore-start assist/source/organizeImports: circular dependencies

import clipboard from "./features/clipboard.slice";
import beatmap from "./features/editor/beatmap.slice";
import lightshow from "./features/editor/lightshow.slice";
import notes from "./features/entities/beatmap/notes.slice";
import obstacles from "./features/entities/beatmap/obstacles.slice";
import bookmarks from "./features/entities/editor/bookmarks.slice";
import basicEvents from "./features/entities/lightshow/basic.slice";
import boostEvents from "./features/entities/lightshow/boost.slice";
import global from "./features/global.slice";
import navigation from "./features/navigation.slice";
import songs from "./features/songs.slice";
import timeline from "./features/timeline.slice";
import user from "./features/user.slice";
import visualizer from "./features/visualizer.slice";

// biome-ignore-end assist/source/organizeImports: circular dependencies

export const { init } = global.actions;

export const rehydrate = createAction("rehydrate", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args } };
});

export const { updateNew, updateAnnouncements, dismissPrompt, updateUsername, updateRenderScale, updateBloomEnabled, updateObstaclePlacementMode, updatePacerWait } = user.actions;

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
	updateTrackScale: updateBeatDepth,
	updatePlaybackRate,
	incrementPlaybackRate,
	decrementPlaybackRate,
	updateSongVolume,
	updateTickVolume,
	updateTickType,
	updateSnap,
	incrementSnap,
	decrementSnap,
} = navigation.actions;

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
	incrementZoom: incrementEventsEditorZoom,
	decrementZoom: decrementEventsEditorZoom,
	updatePreview: updateEventsEditorPreview,
	updateWindowLock: updateEventsEditorWindowLock,
	updateMirrorLock: updateEventsEditorMirrorLock,
} = lightshow.actions;

export const drawEventSelectionBox = createAsyncThunk("drawEventSelectionBox", (args: { songId: SongId; tracks: ITrackDefinitions<unknown>; selectionBoxInBeats: ISelectionBoxInBeats }, api) => {
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

export const addToCell = createAsyncThunk("addToCell", (args: { songId: SongId; posX: number; posY: number; direction?: number; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const selectedDirection = args.direction ?? selectNotesEditorDirection(state);
	const selectedTool = selectNotesEditorTool(state);
	const cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
	const durationInBeats = selectDurationInBeats(state, args.songId);
	if (cursorPositionInBeats < 0 || (durationInBeats !== null && cursorPositionInBeats > durationInBeats)) {
		return api.rejectWithValue("Cannot place objects out-of-bounds.");
	}

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
	return api.fulfillWithValue({ query: { time: adjustedCursorPosition, posX: args.posX, posY: args.posY }, direction: selectedDirection, tool: selectedTool });
});

export const removeFromCell = createAsyncThunk("removeFromCell", (args: { songId: SongId; posX: number; posY: number; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const cursorPositionInBeats = selectCursorPositionInBeats(state, args.songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	return api.fulfillWithValue({ query: { time: cursorPositionInBeats, posX: args.posX, posY: args.posY } });
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

export const { addOne: addBasicEvent, addOne: bulkAddBasicEvent, updateOne: updateBasicEvent } = basicEvents.actions;

export const { addOne: addBoostEvent, addOne: bulkAddBoostEvent, updateOne: updateBoostEvent } = boostEvents.actions;

export const selectEvent = createAction("selectEvent", (args: { query: Parameters<typeof resolveEventId>[0]; environment: EnvironmentName; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const deselectEvent = createAction("deselectEvent", (args: { query: Parameters<typeof resolveEventId>[0]; environment: EnvironmentName; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const removeEvent = createAction("removeEvent", (args: { query: Parameters<typeof resolveEventId>[0]; environment: EnvironmentName; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const bulkRemoveEvent = createAction("bulkRemoveEvent", (args: { query: Parameters<typeof resolveEventId>[0]; environment: EnvironmentName; areLasersLocked: boolean }) => {
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
	const earliestBeat = selectEarliestBeat(state);
	const deltaBetweenPeriods = pasteAtBeat - earliestBeat;
	// Every entity that has an ID (obstacles, events) needs a unique ID, we shouldn't blindly copy it over.
	return api.fulfillWithValue({ ...args, data: data, deltaBetweenPeriods });
});

export const { addOne: addBookmark, removeOne: removeBookmark } = bookmarks.actions;
