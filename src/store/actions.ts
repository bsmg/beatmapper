import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import type WaveformData from "waveform-data";

import { HIGHEST_PRECISION } from "$/constants";
import { getNewBookmarkColor } from "$/helpers/bookmarks.helpers";
import { resolveBeatForItem } from "$/helpers/item.helpers";
import {
	type App,
	type BeatmapEntities,
	type BeatmapId,
	type CutDirection,
	type EventColor,
	type EventEditMode,
	type EventTool,
	type GridPresets,
	type IGrid,
	type ISelectionBox,
	type ISelectionBoxInBeats,
	type Member,
	type ObjectSelectionMode,
	type ObjectTool,
	type ObjectType,
	type Quality,
	type SongId,
	View,
} from "$/types";
import { roundAwayFloatingPointNonsense, roundToNearest } from "$/utils";
import { createEntityStorageActions, createStorageActions } from "./middleware/storage.middleware";
import {
	getCursorPositionInBeats,
	getDurationInBeats,
	getIsPlaying,
	getSelectedCutDirection,
	getSelectedEventBeat,
	getSelectedNoteTool,
	getSnapTo,
	getStartAndEndBeat,
	getStickyMapAuthorName,
	selectActiveSongId,
	selectAllBasicEvents,
	selectAllBookmarks,
	selectAllColorNotes,
	selectAllNotes,
	selectAllObstacles,
	selectAllSelectedEntities,
	selectClipboardData,
	selectGridSize,
	selectSongByIdOrNull,
} from "./selectors";
import type { RootState, SessionStorageObservers, UserStorageObservers } from "./setup";

export const init = createAction("@@APP/INIT");

export const { load: loadUser, save: saveUser, hydrate: hydrateUser } = createStorageActions<RootState, UserStorageObservers>("user");
export const { load: loadSession, save: saveSession, hydrate: hydrateSession } = createStorageActions<RootState, SessionStorageObservers>("session");
export const { load: loadSongs, save: saveSongs, hydrate: hydrateSongs } = createEntityStorageActions<App.Song>("songs");
export const { load: loadGridPresets, save: saveGridPresets, hydrate: hydrateGridPresets } = createEntityStorageActions<Member<GridPresets>>("grids");

export const rehydrate = createAction("@@STORAGE/REHYDRATE");

export const loadDemoSong = createAction("LOAD_DEMO_SONG");

export const createNewSong = createAsyncThunk("CREATE_NEW_SONG", (args: Pick<App.Song, "coverArtFilename" | "songFilename" | "name" | "subName" | "artistName" | "bpm" | "offset"> & { coverArtFile: Blob; songFile: Blob; songId: SongId; selectedDifficulty: BeatmapId }, api) => {
	const state = api.getState() as RootState;

	const mapAuthorName = getStickyMapAuthorName(state);

	return api.fulfillWithValue({ ...args, mapAuthorName, createdAt: Date.now(), lastOpenedAt: Date.now() });
});

export const updateSongDetails = createAction("UPDATE_SONG_DETAILS", (args: { songId: SongId; songData: Partial<App.Song> }) => {
	return { payload: { songId: args.songId, ...args.songData } };
});

export const loadDemoMap = createAction("LOAD_DEMO_MAP");

export const startImportingSong = createAction("START_IMPORTING_SONG");

export const cancelImportingSong = createAction("CANCEL_IMPORTING_SONG");

export const importExistingSong = createAction("IMPORT_EXISTING_SONG", (args: { songData: Omit<App.Song, "id"> & { songId: SongId } }) => {
	return { payload: { ...args, createdAt: Date.now(), lastOpenedAt: Date.now() } };
});

export const changeSelectedDifficulty = createAction("CHANGE_SELECTED_DIFFICULTY", (args: { songId: SongId; difficulty: BeatmapId }) => {
	return { payload: { ...args } };
});

export const createDifficulty = createAction("CREATE_DIFFICULTY", (args: { songId: SongId; difficulty: BeatmapId; afterCreate: (id: BeatmapId) => void }) => {
	return { payload: { ...args } };
});

export const copyDifficulty = createAction("COPY_DIFFICULTY", (args: { songId: SongId; fromDifficultyId: BeatmapId; toDifficultyId: BeatmapId; afterCopy: (id: BeatmapId) => void }) => {
	return { payload: { ...args } };
});

export const startLoadingSong = createAction("START_LOADING_SONG", (args: { songId: SongId; difficulty: BeatmapId }) => {
	return { payload: { ...args } };
});

export const loadBeatmapEntities = createAction("LOAD_BEATMAP_ENTITIES", (args: Partial<BeatmapEntities>) => {
	return { payload: { ...args } };
});

export const finishLoadingSong = createAction("FINISH_LOADING_SONG", (args: { songId: SongId; songData: Omit<App.Song, "id">; waveformData: WaveformData }) => {
	return { payload: { ...args, songData: { ...args.songData, lastOpenedAt: Date.now() } } };
});

export const reloadWaveform = createAction("RELOAD_WAVEFORM", (args: { waveformData: WaveformData }) => {
	return { payload: { ...args } };
});

export const startPlaying = createAction("START_PLAYING");

export const pausePlaying = createAction("PAUSE_PLAYING");

export const stopPlaying = createAction("STOP_PLAYING", (args: { offset: number }) => {
	return { payload: { ...args } };
});

export const togglePlaying = createAction("TOGGLE_PLAYING");

export const tick = createAction("TICK", (args: { timeElapsed: number }) => {
	return { payload: { ...args } };
});

export const cutSelection = createAsyncThunk("CUT_SELECTION", (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const selection = selectAllSelectedEntities(state, args.view);
	return api.fulfillWithValue({ ...args, data: selection });
});

export const copySelection = createAsyncThunk("COPY_SELECTION", (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const selection = selectAllSelectedEntities(state, args.view);
	return api.fulfillWithValue({ ...args, data: selection });
});

export const pasteSelection = createAsyncThunk("PASTE_SELECTION", (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const data = selectClipboardData(state);
	// If there's nothing copied, do nothing
	if (!data) return api.rejectWithValue("Clipboard is empty.");
	// When pasting in notes view, we want to paste at the cursor position, where the song is currently playing.
	// For the events view, we want to paste it where the mouse cursor is, the selected beat.
	const pasteAtBeat = args.view === View.BEATMAP ? getCursorPositionInBeats(state, songId) : getSelectedEventBeat(state);
	if (pasteAtBeat === null) return api.rejectWithValue("Invalid beat number.");
	const earliestBeat = [...(data.notes ?? []), ...(data.obstacles ?? []), ...(data.events ?? [])].map((x) => resolveBeatForItem(x)).sort((a, b) => a - b)[0];
	const deltaBetweenPeriods = pasteAtBeat - earliestBeat;
	// Every entity that has an ID (obstacles, events) needs a unique ID, we shouldn't blindly copy it over.
	return api.fulfillWithValue({ ...args, data: data, deltaBetweenPeriods });
});

export const adjustCursorPosition = createAction("ADJUST_CURSOR_POSITION", (args: { newCursorPosition: number }) => {
	return { payload: { ...args } };
});

export const createBookmark = createAsyncThunk("CREATE_BOOKMARK", (args: { name: string; view: View }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const existingBookmarks = selectAllBookmarks(state);
	const color = getNewBookmarkColor(existingBookmarks);
	// For the notes view, we want to use the cursorPosition to figure out when to create the bookmark for.
	// For the events view, we want it to be based on the mouse position.
	const beatNum = args.view === View.LIGHTSHOW ? getSelectedEventBeat(state) : getCursorPositionInBeats(state, songId);
	if (beatNum === null) return api.rejectWithValue("Invalid beat number.");
	return api.fulfillWithValue({ ...args, beatNum, color });
});

export const deleteBookmark = createAction("DELETE_BOOKMARK", (args: { beatNum: number }) => {
	return { payload: { ...args } };
});

export const clickPlacementGrid = createAsyncThunk("CLICK_PLACEMENT_GRID", (args: { rowIndex: number; colIndex: number; direction?: CutDirection; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const selectedDirection = getSelectedCutDirection(state);
	const selectedTool = getSelectedNoteTool(state);
	const cursorPositionInBeats = getCursorPositionInBeats(state, songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	const duration = getDurationInBeats(state, songId);
	if (cursorPositionInBeats < 0 || (duration && cursorPositionInBeats > duration)) return api.rejectWithValue("Cannot place objects out-of-bounds.");
	const adjustedCursorPosition = adjustNoteCursorPosition(cursorPositionInBeats, state);
	const alreadyExists = selectAllNotes(state).some((note) => note.beatNum === adjustedCursorPosition && note.colIndex === args.colIndex && note.rowIndex === args.rowIndex);
	if (alreadyExists) return api.rejectWithValue("Tried to add a double-note in the same spot.");
	return api.fulfillWithValue({ ...args, cursorPositionInBeats: adjustedCursorPosition, direction: selectedDirection, tool: selectedTool });
});

export const clearCellOfNotes = createAsyncThunk("CLEAR_CELL_OF_NOTES", (args: { rowIndex: number; colIndex: number; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const cursorPositionInBeats = getCursorPositionInBeats(state, songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	return api.fulfillWithValue({ ...args, cursorPositionInBeats });
});

export const setBlockByDragging = createAsyncThunk("SET_BLOCK_BY_DRAGGING", (args: { rowIndex: number; colIndex: number; direction: CutDirection; tool: ObjectTool }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const cursorPositionInBeats = getCursorPositionInBeats(state, songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	const adjustedCursorPosition = adjustNoteCursorPosition(cursorPositionInBeats, state);
	return api.fulfillWithValue({ ...args, cursorPositionInBeats: adjustedCursorPosition });
});

export const zoomWaveform = createAction("ZOOM_WAVEFORM", (args: { amount: number }) => {
	return { payload: { ...args } };
});

export const scrubWaveform = createAction("SCRUB_WAVEFORM", (args: { newOffset: number }) => {
	return { payload: { ...args } };
});

export const scrubEventsHeader = createAction("SCRUB_EVENTS_HEADER", (args: { selectedBeat: number }) => {
	return { payload: { ...args } };
});

export const scrollThroughSong = createAction("SCROLL_THROUGH_SONG", (args: { direction: "forwards" | "backwards" }) => {
	return { payload: { ...args } };
});

export const skipToStart = createAsyncThunk("SKIP_TO_START", (_, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const song = selectSongByIdOrNull(state, songId);
	const offset = song?.offset ?? 0;
	return api.fulfillWithValue({ offset });
});

export const skipToEnd = createAction("SKIP_TO_END");

export const changeSnapping = createAction("CHANGE_SNAPPING", (args: { newSnapTo: number }) => {
	return { payload: { ...args } };
});

export const incrementSnapping = createAction("INCREMENT_SNAPPING");

export const decrementSnapping = createAction("DECREMENT_SNAPPING");

export const selectNoteDirection = createAction("SELECT_NOTE_DIRECTION", (args: { direction: CutDirection }) => {
	return { payload: { ...args } };
});

export const selectTool = createAction("SELECT_TOOL", (args: { view: View; tool: ObjectTool | EventTool }) => {
	return { payload: { ...args } };
});

export const selectNextTool = createAction("SELECT_NEXT_TOOL", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const selectPreviousTool = createAction("SELECT_PREVIOUS_TOOL", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const clickNote = createAction("CLICK_NOTE", (args: { clickType: "left" | "middle" | "right"; time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const mouseOverNote = createAction("MOUSE_OVER_NOTE", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const toggleNoteColor = createAction("TOGGLE_NOTE_COLOR", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const selectNote = createAction("SELECT_NOTE", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const deselectNote = createAction("DESELECT_NOTE", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const selectObstacle = createAction("SELECT_OBSTACLE", (args: { id: App.Obstacle["id"] }) => {
	return { payload: { ...args } };
});

export const deselectObstacle = createAction("DESELECT_OBSTACLE", (args: { id: App.Obstacle["id"] }) => {
	return { payload: { ...args } };
});

export const deselectAll = createAction("DESELECT_ALL", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const deselectAllOfType = createAction("DESELECT_ALL_OF_TYPE", (args: { itemType: ObjectType }) => {
	return { payload: { ...args } };
});

export const selectAll = createAsyncThunk("SELECT_ALL", (args: { view: View }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	// For the events view, we don't actually want to select EVERY note. We only want to select what is visible in the current frame.
	let metadata = null;
	if (args.view === View.LIGHTSHOW) {
		const { startBeat, endBeat } = getStartAndEndBeat(state, songId);
		metadata = { startBeat, endBeat };
	}
	return api.fulfillWithValue({ ...args, metadata });
});

export const toggleSelectAll = createAsyncThunk("TOGGLE_SELECT_ALL", (args: { view: View }, api) => {
	const state = api.getState() as RootState;

	let anythingSelected = false;

	if (args.view === View.BEATMAP) {
		const notes = selectAllColorNotes(state);
		const obstacles = selectAllObstacles(state);

		const anyNotesSelected = notes.some((n) => n.selected);
		const anyObstaclesSelected = obstacles.some((s) => s.selected);

		anythingSelected = anyNotesSelected || anyObstaclesSelected;
	} else if (args.view === View.LIGHTSHOW) {
		const events = selectAllBasicEvents(state);

		anythingSelected = events.some((e) => e.selected);
	}

	if (anythingSelected) {
		api.dispatch(deselectAll({ view: args.view }));
	} else {
		api.dispatch(selectAll({ view: args.view }));
	}
});

export const selectAllInRange = createAction("SELECT_ALL_IN_RANGE", (args: { view: View; start: number; end: number }) => {
	return { payload: { ...args } };
});

export const deleteNote = createAction("DELETE_NOTE", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const bulkDeleteNote = createAction("BULK_DELETE_NOTE", (args: { time: number; lineLayer: number; lineIndex: number }) => {
	return { payload: { ...args } };
});

export const deleteSelectedNotes = createAction("DELETE_SELECTED_NOTES");

export const startManagingNoteSelection = createAction("START_MANAGING_NOTE_SELECTION", (args: { selectionMode: ObjectSelectionMode }) => {
	return { payload: { ...args } };
});

export const finishManagingNoteSelection = createAction("FINISH_MANAGING_NOTE_SELECTION");

export const moveMouseAcrossEventsGrid = createAction("MOVE_MOUSE_ACROSS_EVENTS_GRID", (args: { selectedBeat: number }) => {
	return { payload: { ...args } };
});

export const downloadMapFiles = createAction("DOWNLOAD_MAP_FILES", (args: { songId: SongId; version?: number }) => {
	return { payload: { ...args, version: args.version ?? 2 } };
});

export const updateBeatmapMetadata = createAction("UPDATE_BEATMAP_METADATA", (args: { songId: SongId; difficulty: BeatmapId; noteJumpSpeed: number; startBeatOffset: number; customLabel?: string }) => {
	return { payload: { ...args } };
});

export const deleteBeatmap = createAction("DELETE_BEATMAP", (args: { songId: SongId; difficulty: BeatmapId }) => {
	return { payload: { ...args } };
});

export const updatePlaybackSpeed = createAction("UPDATE_PLAYBACK_SPEED", (args: { playbackRate: number }) => {
	return { payload: { ...args } };
});

export const updateBeatDepth = createAction("UPDATE_BEAT_DEPTH", (args: { beatDepth: number }) => {
	return { payload: { ...args } };
});

export const updateVolume = createAction("UPDATE_VOLUME", (args: { volume: number }) => {
	return { payload: { ...args } };
});

export const createNewObstacle = createAsyncThunk("CREATE_NEW_OBSTACLE", (args: { obstacle: App.Obstacle }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	let cursorPositionInBeats = getCursorPositionInBeats(state, songId);
	if (cursorPositionInBeats === null) return api.rejectWithValue("Invalid beat number.");
	cursorPositionInBeats = roundAwayFloatingPointNonsense(cursorPositionInBeats);
	return api.fulfillWithValue({
		obstacle: {
			...args.obstacle,
			beatNum: cursorPositionInBeats,
		} as Omit<App.Obstacle, "id">,
	});
});

export const deleteObstacle = createAction("DELETE_OBSTACLE", (args: { id: App.Obstacle["id"] }) => {
	return { payload: { ...args } };
});

export const resizeObstacle = createAction("RESIZE_OBSTACLE", (args: { id: App.Obstacle["id"]; newBeatDuration: number }) => {
	return { payload: { ...args } };
});

export const resizeSelectedObstacles = createAction("RESIZE_SELECTED_OBSTACLES", (args: { newBeatDuration: number }) => {
	return { payload: { ...args } };
});

export const undoNotes = createAction("UNDO_NOTES");

export const redoNotes = createAction("REDO_NOTES");

export const undoEvents = createAction("UNDO_EVENTS");

export const redoEvents = createAction("REDO_EVENTS");

export const deleteSong = createAction("DELETE_SONG", (args: Pick<App.Song, "id" | "difficultiesById" | "songFilename" | "coverArtFilename">) => {
	return { payload: { ...args } };
});

export const toggleNoteTick = createAction("TOGGLE_NOTE_TICK");

export const leaveEditor = createAction("LEAVE_EDITOR", (args: { songId: SongId; difficulty: BeatmapId }) => {
	return { payload: { ...args } };
});

export const swapSelectedNotes = createAction("SWAP_SELECTED_NOTES", (args: { axis: "horizontal" | "vertical" }) => {
	return { payload: { ...args } };
});

export const nudgeSelection = createAsyncThunk("NUDGE_SELECTION", (args: { direction: "forwards" | "backwards"; view: View }, api) => {
	const state = api.getState() as RootState;
	const snapTo = getSnapTo(state);
	return api.fulfillWithValue({ ...args, amount: snapTo });
});

export const jumpToBeat = createAction("JUMP_TO_BEAT", (args: { beatNum: number; pauseTrack?: boolean; animateJump?: boolean }) => {
	return { payload: { ...args } };
});

export const seekForwards = createAction("SEEK_FORWARDS", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const seekBackwards = createAction("SEEK_BACKWARDS", (args: { view: View }) => {
	return { payload: { ...args } };
});

export const placeEvent = createAction("PLACE_EVENT", (args: { trackId: App.TrackId; beatNum: number; eventType: App.BasicEventType; eventColorType?: App.EventColor; eventLaserSpeed?: number; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const bulkPlaceEvent = createAction("BULK_PLACE_EVENT", (args: { trackId: App.TrackId; beatNum: number; eventType: App.BasicEventType; eventColorType?: App.EventColor; eventLaserSpeed?: number; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const changeLaserSpeed = createAction("CHANGE_LASER_SPEED", (args: { trackId: App.TrackId; beatNum: number; speed: number; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const deleteEvent = createAction("DELETE_EVENT", (args: { beatNum: number; trackId: App.TrackId; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const bulkDeleteEvent = createAction("BULK_DELETE_EVENT", (args: { beatNum: number; trackId: App.TrackId; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const deleteSelectedEvents = createAction("DELETE_SELECTED_EVENTS");

export const selectEvent = createAction("SELECT_EVENT", (args: { beatNum: number; trackId: App.TrackId; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const deselectEvent = createAction("DESELECT_EVENT", (args: { beatNum: number; trackId: App.TrackId; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export const selectColor = createAction("SELECT_COLOR", (args: { view: View; color: App.SaberColor | App.EventColor | EventColor }) => {
	return { payload: { ...args } };
});

export const switchEventColor = createAction("SWITCH_EVENT_COLOR", (args: { beatNum: number; trackId: App.TrackId; areLasersLocked: boolean }) => {
	return { payload: { ...args } };
});

export function selectEventColor(args: { color: App.EventColor | EventColor }) {
	return selectColor({ ...args, view: View.LIGHTSHOW });
}

export const selectEventEditMode = createAction("SELECT_EVENT_EDIT_MODE", (args: { editMode: EventEditMode }) => {
	return { payload: { ...args } };
});

export const zoomIn = createAction("ZOOM_IN");

export const zoomOut = createAction("ZOOM_OUT");

export const drawSelectionBox = createAsyncThunk("DRAW_SELECTION_BOX", (args: { selectionBox: ISelectionBox; selectionBoxInBeats: ISelectionBoxInBeats }, api) => {
	const state = api.getState() as RootState;
	const songId = selectActiveSongId(state);
	const { startBeat, endBeat } = getStartAndEndBeat(state, songId);
	const metadata = { window: { startBeat, endBeat } };
	return api.fulfillWithValue({ ...args, metadata });
});

export const clearSelectionBox = createAction("CLEAR_SELECTION_BOX");

export const commitSelection = createAction("COMMIT_SELECTION");

export const togglePreviewLightingInEventsView = createAction("TOGGLE_PREVIEW_LIGHTING_IN_EVENTS_VIEW");

export const tweakEventRowHeight = createAction("TWEAK_EVENT_ROW_HEIGHT", (args: { newHeight: number }) => {
	return { payload: { ...args } };
});

export const tweakEventBackgroundOpacity = createAction("TWEAK_EVENT_BACKGROUND_OPACITY", (args: { newOpacity: number }) => {
	return { payload: { ...args } };
});

export const dismissPrompt = createAction("DISMISS_PROMPT", (args: { promptId: string }) => {
	return { payload: { ...args } };
});

export const toggleEventWindowLock = createAction("TOGGLE_EVENT_WINDOW_LOCK");

export const toggleLaserLock = createAction("TOGGLE_LASER_LOCK");

export const toggleModForSong = createAction("TOGGLE_MOD_FOR_SONG", (args: { songId: SongId; mod: keyof App.ModSettings }) => {
	return { payload: { ...args } };
});

export const updateModColor = createAction("UPDATE_MOD_COLOR", (args: { songId: SongId; element: App.BeatmapColorKey; color: string }) => {
	return { payload: { ...args } };
});

export const updateModColorOverdrive = createAction("UPDATE_MOD_COLOR_OVERDRIVE", (args: { songId: SongId; element: App.BeatmapColorKey; overdrive: number }) => {
	return { payload: { ...args } };
});

export const updateGrid = createAction("UPDATE_GRID", (args: { songId: SongId; grid: Partial<IGrid> }) => {
	return { payload: { ...args } };
});

export const resetGrid = createAction("RESET_GRID", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});

export const loadGridPreset = createAction("LOAD_GRID_PRESET", (args: { songId: SongId; grid: IGrid }) => {
	return { payload: { ...args } };
});

export const saveGridPreset = createAsyncThunk("SAVE_GRID_PRESET", (args: { songId: SongId; presetSlot: string }, api) => {
	const state = api.getState() as RootState;
	const grid = selectGridSize(state, args.songId ?? null);
	return api.fulfillWithValue({ ...args, grid });
});

export const deleteGridPreset = createAction("DELETE_GRID_PRESET", (args: { songId: SongId; presetSlot: string }) => {
	return { payload: { ...args } };
});

export const toggleFastWallsForSelectedObstacles = createAction("TOGGLE_FAST_WALLS_FOR_SELECTED_OBSTACLES");

export const togglePropertyForSelectedSong = createAction("TOGGLE_PROPERTY_FOR_SELECTED_SONG", (args: { songId: SongId; property: keyof App.Song }) => {
	return { payload: { ...args } };
});

export const updateProcessingDelay = createAction("UPDATE_PROCESSING_DELAY", (args: { newDelay: number }) => {
	return { payload: { ...args } };
});

export const updateGraphicsLevel = createAction("UPDATE_GRAPHICS_LEVEL", (args: { newGraphicsLevel: Quality }) => {
	return { payload: { ...args } };
});

function adjustNoteCursorPosition(cursorPositionInBeats: number, state: RootState) {
	const isPlaying = getIsPlaying(state);

	if (isPlaying) {
		// If the user tries to place blocks while the song is playing, we want to snap to the nearest snapping interval.
		// eg. if they're set to snap to 1/2 beats, and they click when the song is 3.476 beats in, we should round up to 3.5.
		const snapTo = getSnapTo(state);
		return roundToNearest(cursorPositionInBeats, snapTo);
	}
	// If the song isn't playing, we want to snap to the highest precision we have.
	// Note that this will mean a slight tweak for notes that are a multiple of 3 (eg. a note at 1.333 beats will be rounded to 1.328125)
	return roundToNearest(cursorPositionInBeats, HIGHEST_PRECISION);
}
