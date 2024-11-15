import { createSelector, createSlice } from "@reduxjs/toolkit";

import { DEFAULT_COL_WIDTH, DEFAULT_GRID, DEFAULT_MOD_SETTINGS, DEFAULT_NOTE_JUMP_SPEEDS, DEFAULT_ROW_HEIGHT } from "$/constants";
import { sortDifficultyIds } from "$/helpers/song.helpers";
import {
	cancelImportingSong,
	changeSelectedDifficulty,
	copyDifficulty,
	createDifficulty,
	createNewSong,
	deleteBeatmap,
	deleteSong,
	finishLoadingSong,
	hydrateSnapshot,
	importExistingSong,
	leaveEditor,
	loadGridPreset,
	resetGrid,
	startImportingSong,
	startLoadingSong,
	toggleModForSong,
	togglePropertyForSelectedSong,
	updateBeatmapMetadata,
	updateGrid,
	updateModColor,
	updateModColorOverdrive,
	updateSongDetails,
} from "$/store/actions";
import { type App, type Difficulty, Environment, ObjectPlacementMode, type SongId } from "$/types";
import { STORAGE_KEY } from "../setup";

const initialState = {
	byId: {} as Record<SongId, App.Song>,
	selectedId: null as SongId | null,
	processingImport: false,
};

type SelectedSong<A extends boolean> = A extends true ? App.Song : App.Song | undefined;
function grabSelectedSong<A extends boolean>() {
	return (state: typeof initialState) => {
		if (state.selectedId) return state.byId[state.selectedId];
		return undefined as SelectedSong<A>;
	};
}

const slice = createSlice({
	name: "songs",
	initialState: initialState,
	selectors: {
		getAllSongs: (state) => Object.values(state.byId),
		getAllSongIds: (state) => Object.keys(state.byId),
		getAllSongsChronologically: (state) => {
			return Object.values(state.byId).sort((a, b) => {
				return a.lastOpenedAt > b.lastOpenedAt ? -1 : 1;
			});
		},
		getProcessingImport: (state) => state.processingImport,
		getSongById: (state, songId: SongId) => state.byId[songId],
		getSelectedSongId: (state) => state.selectedId,
		getSelectedSong: grabSelectedSong<true>(),
		getSelectedSongDifficultyIds: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			const ids = Object.keys(song.difficultiesById) as Difficulty[];
			return sortDifficultyIds(ids);
		}),
		getDemoSong: (state) => {
			return Object.values(state.byId).find((song) => song.demo);
		},
		getGridSize: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			const mappingExtensions = song.modSettings.mappingExtensions;
			// In legacy states, `mappingExtensions` was a boolean, and it was possible to not have the key at all.
			const isLegacy = typeof mappingExtensions === "boolean" || !mappingExtensions;
			const isDisabled = mappingExtensions?.isEnabled === false;
			if (isLegacy || isDisabled) return DEFAULT_GRID;
			return {
				numRows: mappingExtensions.numRows,
				numCols: mappingExtensions.numCols,
				colWidth: mappingExtensions.colWidth || DEFAULT_COL_WIDTH,
				rowHeight: mappingExtensions.rowHeight || DEFAULT_ROW_HEIGHT,
			};
		}),
		getEnabledMods: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			return {
				mappingExtensions: song.modSettings.mappingExtensions?.isEnabled,
				customColors: song.modSettings.customColors?.isEnabled,
			};
		}),
		getEnabledFastWalls: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			return song.enabledFastWalls;
		}),
		getEnabledLightshow: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			return song.enabledLightshow;
		}),
		getCustomColors: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			const colors = song.modSettings.customColors;
			if (!colors) return DEFAULT_MOD_SETTINGS.customColors;
			return { ...DEFAULT_MOD_SETTINGS.customColors, ...colors };
		}),
		getMappingMode: createSelector(grabSelectedSong<true>(), (song: App.Song) => {
			return song.modSettings.mappingExtensions?.isEnabled ? ObjectPlacementMode.EXTENSIONS : ObjectPlacementMode.NORMAL;
		}),
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSnapshot, (state, action) => {
			const byId = action.payload[STORAGE_KEY]?.songs.byId ?? state.byId;
			return { ...state, byId: { ...state.byId, ...byId } };
		});
		builder.addCase(startLoadingSong, (state, action) => {
			const { songId, difficulty } = action.payload;
			state.selectedId = songId;
			state.byId[songId].selectedDifficulty = difficulty;
		});
		builder.addCase(finishLoadingSong, (state, action) => {
			const { song, lastOpenedAt } = action.payload;
			const draftSong = state.byId[song.id];
			draftSong.lastOpenedAt = lastOpenedAt;
			draftSong.modSettings = draftSong.modSettings || {};
		});
		builder.addCase(leaveEditor, (state) => {
			return { ...state, selectedId: null };
		});
		builder.addCase(startImportingSong, (state) => {
			return { ...state, processingImport: true };
		});
		builder.addCase(cancelImportingSong, (state) => {
			return { ...state, processingImport: false };
		});
		builder.addCase(createNewSong.fulfilled, (state, action) => {
			const { coverArtFilename, songFilename, songId, name, subName, artistName, bpm, offset, selectedDifficulty, mapAuthorName, createdAt, lastOpenedAt } = action.payload;
			state.selectedId = songId;
			state.byId[songId] = {
				id: songId,
				name,
				subName,
				artistName,
				bpm,
				offset,
				previewStartTime: 12,
				previewDuration: 10,
				songFilename,
				coverArtFilename,
				environment: Environment.THE_FIRST,
				mapAuthorName: mapAuthorName ?? undefined,
				createdAt,
				lastOpenedAt,
				selectedDifficulty,
				difficultiesById: {
					[selectedDifficulty]: {
						id: selectedDifficulty,
						noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[selectedDifficulty as Difficulty],
						startBeatOffset: 0,
						customLabel: "",
					},
				},
				modSettings: DEFAULT_MOD_SETTINGS,
			};
		});
		builder.addCase(importExistingSong, (state, action) => {
			const {
				createdAt,
				lastOpenedAt,
				songData: { songId, songFilename, coverArtFilename, name, subName, artistName, mapAuthorName, bpm, offset, swingAmount, swingPeriod, previewStartTime, previewDuration, environment, difficultiesById, demo, modSettings = {}, enabledFastWalls = false, enabledLightshow = false },
			} = action.payload;
			const selectedDifficulty = Object.keys(difficultiesById)[0];
			state.processingImport = false;
			state.byId[songId] = {
				id: songId,
				name,
				subName,
				artistName,
				mapAuthorName,
				bpm,
				offset,
				swingAmount,
				swingPeriod,
				previewStartTime,
				previewDuration,
				songFilename,
				coverArtFilename,
				environment,
				selectedDifficulty,
				difficultiesById,
				createdAt,
				lastOpenedAt,
				demo,
				modSettings,
				enabledFastWalls,
				enabledLightshow,
			};
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { songId, ...fieldsToUpdate } = action.payload;
			state.byId[songId] = { ...state.byId[songId], ...fieldsToUpdate };
		});
		builder.addCase(createDifficulty, (state, action) => {
			const { difficulty } = action.payload;
			const selectedSongId = state.selectedId;
			if (!selectedSongId) return state;
			const song = state.byId[selectedSongId];
			song.selectedDifficulty = difficulty;
			song.difficultiesById[difficulty] = {
				id: difficulty,
				noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[difficulty as Difficulty],
				startBeatOffset: 0,
				customLabel: "",
			};
		});
		builder.addCase(copyDifficulty, (state, action) => {
			const { songId, fromDifficultyId, toDifficultyId } = action.payload;
			const song = state.byId[songId];
			const newDifficultyObj = { ...song.difficultiesById[fromDifficultyId], id: toDifficultyId };
			song.selectedDifficulty = toDifficultyId;
			song.difficultiesById[toDifficultyId] = newDifficultyObj;
		});
		builder.addCase(changeSelectedDifficulty, (state, action) => {
			const { songId, difficulty } = action.payload;
			const song = state.byId[songId];
			song.selectedDifficulty = difficulty;
		});
		builder.addCase(deleteBeatmap, (state, action) => {
			const { songId, difficulty } = action.payload;
			delete state.byId[songId].difficultiesById[difficulty];
		});
		builder.addCase(updateBeatmapMetadata, (state, action) => {
			const { songId, difficulty, noteJumpSpeed, startBeatOffset, customLabel } = action.payload;
			const currentBeatmapDifficulty = state.byId[songId].difficultiesById[difficulty];
			currentBeatmapDifficulty.noteJumpSpeed = noteJumpSpeed;
			currentBeatmapDifficulty.startBeatOffset = startBeatOffset;
			currentBeatmapDifficulty.customLabel = customLabel;
		});
		builder.addCase(deleteSong, (state, action) => {
			const { id: songId } = action.payload;
			delete state.byId[songId];
		});
		builder.addCase(toggleModForSong, (state, action) => {
			const { mod } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return state;
			// For a brief moment, modSettings was being set to an empty object, before the children were required. Update that now, if so.
			if (!song.modSettings) song.modSettings ??= DEFAULT_MOD_SETTINGS;
			// Also for a brief moment, modSettings didn't always have properties for each mod
			// @ts-ignore false positive
			if (!song.modSettings[mod]) song.modSettings[mod] ??= DEFAULT_MOD_SETTINGS[mod];
			const isModEnabled = song.modSettings[mod].isEnabled;
			song.modSettings[mod].isEnabled = !isModEnabled;
		});
		builder.addCase(updateModColor, (state, action) => {
			const { element, color } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			if (!song.modSettings.customColors) song.modSettings.customColors ??= DEFAULT_MOD_SETTINGS.customColors;
			song.modSettings.customColors[element] = color;
		});
		builder.addCase(updateModColorOverdrive, (state, action) => {
			const { element, overdrive } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			const elementOverdriveKey = `${element}Overdrive` as const;
			if (!song.modSettings.customColors) song.modSettings.customColors ??= DEFAULT_MOD_SETTINGS.customColors;
			song.modSettings.customColors[elementOverdriveKey] = overdrive;
		});
		builder.addCase(updateGrid, (state, action) => {
			const { numRows, numCols, colWidth, rowHeight } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			if (!song.modSettings.mappingExtensions) song.modSettings.mappingExtensions ??= DEFAULT_MOD_SETTINGS.mappingExtensions;
			song.modSettings.mappingExtensions.numRows = numRows;
			song.modSettings.mappingExtensions.numCols = numCols;
			song.modSettings.mappingExtensions.colWidth = colWidth;
			song.modSettings.mappingExtensions.rowHeight = rowHeight;
		});
		builder.addCase(resetGrid, (state) => {
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			if (!song.modSettings.mappingExtensions) song.modSettings.mappingExtensions ??= DEFAULT_MOD_SETTINGS.mappingExtensions;
			song.modSettings.mappingExtensions = { ...song.modSettings.mappingExtensions, ...DEFAULT_GRID };
		});
		builder.addCase(loadGridPreset, (state, action) => {
			const { grid } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			if (!song.modSettings.mappingExtensions) song.modSettings.mappingExtensions ??= DEFAULT_MOD_SETTINGS.mappingExtensions;
			song.modSettings.mappingExtensions = { ...song.modSettings.mappingExtensions, ...grid };
		});
		builder.addCase(togglePropertyForSelectedSong, (state, action) => {
			const { property } = action.payload;
			const song = grabSelectedSong<false>()(state);
			if (!song) return;
			// @ts-ignore false positive
			song[property] = !song[property];
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
