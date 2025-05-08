import { createEntityAdapter, createSelector, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { EnvironmentName } from "bsmap/types";

import { DEFAULT_COL_WIDTH, DEFAULT_GRID, DEFAULT_MOD_SETTINGS, DEFAULT_NOTE_JUMP_SPEEDS, DEFAULT_ROW_HEIGHT } from "$/constants";
import { resolveBeatmapId, resolveSongId, sortBeatmaps } from "$/helpers/song.helpers";
import {
	changeSelectedDifficulty,
	copyDifficulty,
	createDifficulty,
	createNewSong,
	deleteBeatmap,
	deleteSong,
	finishLoadingSong,
	hydrateSongs,
	importExistingSong,
	loadGridPreset,
	resetGrid,
	startLoadingSong,
	toggleModForSong,
	togglePropertyForSelectedSong,
	updateBeatmapMetadata,
	updateGrid,
	updateModColor,
	updateModColorOverdrive,
	updateSongDetails,
} from "$/store/actions";
import { type App, type BeatmapId, ObjectPlacementMode, type SongId } from "$/types";
import { deepMerge } from "$/utils";

const adapter = createEntityAdapter<App.Song, SongId>({
	selectId: resolveSongId,
	sortComparer: (a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0),
});
const { selectEntities, selectAll, selectIds, selectById } = adapter.getSelectors();

function selectByIdOrNull(state: ReturnType<typeof adapter.getInitialState>, songId: SongId | null) {
	if (!songId) return undefined;
	return selectById(state, songId);
}

const slice = createSlice({
	name: "songs",
	initialState: adapter.getInitialState(),
	selectors: {
		selectEntities: selectEntities,
		selectAll: selectAll,
		selectIds: selectIds,
		selectById: selectById,
		selectByIdOrNull: selectByIdOrNull,
		selectBeatmaps: createSelector(selectByIdOrNull, (song) => {
			if (!song) return {};
			return song.difficultiesById;
		}),
		selectAllBeatmaps: createSelector(selectByIdOrNull, (song) => {
			if (!song) return [];
			return Object.values(song.difficultiesById);
		}),
		selectBeatmapIds: createSelector(selectByIdOrNull, (song) => {
			if (!song) return [];
			return Object.values(song.difficultiesById)
				.sort(sortBeatmaps)
				.map((beatmap) => beatmap.beatmapId);
		}),
		selectBeatmapById: createSelector([selectByIdOrNull, (_1, _2, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			if (!song) throw new Error(`No beatmap found for id: ${beatmapId}`);
			return song.difficultiesById[beatmapId];
		}),
		selectIsDemo: createSelector(selectByIdOrNull, (song) => {
			return !!song?.demo;
		}),
		selectIsModuleEnabled: createSelector([selectByIdOrNull, (_1, _2, key: keyof App.ModSettings) => key], (song, key) => {
			return !!song?.modSettings[key]?.isEnabled;
		}),
		selectIsFastWallsEnabled: createSelector(selectByIdOrNull, (song) => {
			return !!song?.enabledFastWalls;
		}),
		selectIsLightshowEnabled: createSelector(selectByIdOrNull, (song) => {
			return !!song?.enabledLightshow;
		}),
		selectCustomColors: createSelector(selectByIdOrNull, (song) => {
			const colors = song?.modSettings.customColors;
			if (!colors) return DEFAULT_MOD_SETTINGS.customColors;
			return { ...DEFAULT_MOD_SETTINGS.customColors, ...colors };
		}),
		selectGridSize: createSelector(selectByIdOrNull, (song) => {
			const mappingExtensions = song?.modSettings.mappingExtensions;
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
		selectPlacementMode: createSelector(selectByIdOrNull, (song) => {
			return song?.modSettings.mappingExtensions?.isEnabled ? ObjectPlacementMode.EXTENSIONS : ObjectPlacementMode.NORMAL;
		}),
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(hydrateSongs, (state, action) => {
			const byId = action.payload;
			return adapter.upsertMany(state, Object.values(byId));
		});
		builder.addCase(startLoadingSong, (state, action) => {
			const { songId, beatmapId } = action.payload;
			return adapter.updateOne(state, { id: songId, changes: { selectedDifficulty: beatmapId } });
		});
		builder.addCase(finishLoadingSong, (state, action) => {
			const {
				songId,
				songData: { lastOpenedAt },
			} = action.payload;
			return adapter.updateOne(state, { id: songId, changes: { lastOpenedAt } });
		});
		builder.addCase(createNewSong.fulfilled, (state, action) => {
			const { coverArtFilename, songFilename, songId, name, subName, artistName, bpm, offset, selectedCharacteristic, selectedDifficulty, mapAuthorName, createdAt, lastOpenedAt } = action.payload;
			const beatmapId = resolveBeatmapId({ characteristic: selectedCharacteristic, difficulty: selectedDifficulty });
			return adapter.addOne(state, {
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
				environment: EnvironmentName[0],
				mapAuthorName: mapAuthorName ?? undefined,
				createdAt,
				lastOpenedAt,
				selectedDifficulty,
				difficultiesById: {
					[beatmapId]: {
						beatmapId: beatmapId,
						lightshowId: "Unnamed",
						characteristic: selectedCharacteristic,
						difficulty: selectedDifficulty,
						noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[selectedDifficulty],
						startBeatOffset: 0,
					},
				},
				modSettings: DEFAULT_MOD_SETTINGS,
			});
		});
		builder.addCase(importExistingSong, (state, action) => {
			const { songData } = action.payload;
			return adapter.upsertOne(state, songData);
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { songId, ...fieldsToUpdate } = action.payload;
			return adapter.updateOne(state, { id: songId, changes: fieldsToUpdate });
		});
		builder.addCase(createDifficulty, (state, action) => {
			const { songId, beatmapId, lightshowId, data } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					difficultiesById: deepMerge(song.difficultiesById, {
						[beatmapId]: {
							beatmapId: beatmapId,
							lightshowId: lightshowId,
							characteristic: data.characteristic,
							difficulty: data.difficulty,
							noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[data.difficulty],
							startBeatOffset: 0,
						},
					}),
				},
			});
		});
		builder.addCase(copyDifficulty, (state, action) => {
			const { songId, fromBeatmapId, toBeatmapId } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					difficultiesById: deepMerge(song.difficultiesById, {
						[toBeatmapId]: { ...song.difficultiesById[fromBeatmapId], beatmapId: toBeatmapId },
					}),
				},
			});
		});
		builder.addCase(changeSelectedDifficulty, (state, action) => {
			const { songId, beatmapId } = action.payload;
			return adapter.updateOne(state, { id: songId, changes: { selectedDifficulty: beatmapId } });
		});
		builder.addCase(deleteBeatmap, (state, action) => {
			const { songId, beatmapId } = action.payload;
			const song = selectById(state, songId);
			const difficultiesById = Object.entries(song.difficultiesById).reduce(
				(acc, [bid, beatmap]) => {
					if (bid === beatmapId) return acc;
					acc[bid] = beatmap;
					return acc;
				},
				{} as typeof song.difficultiesById,
			);
			return adapter.updateOne(state, { id: songId, changes: { difficultiesById: difficultiesById } });
		});
		builder.addCase(updateBeatmapMetadata, (state, action) => {
			const { songId, beatmapId, noteJumpSpeed, startBeatOffset, customLabel } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					difficultiesById: deepMerge(song.difficultiesById, {
						[beatmapId]: { ...song.difficultiesById[beatmapId], noteJumpSpeed, startBeatOffset, customLabel },
					}),
				},
			});
		});
		builder.addCase(deleteSong, (state, action) => {
			const { id: songId } = action.payload;
			return adapter.removeOne(state, songId);
		});
		builder.addCase(toggleModForSong, (state, action) => {
			const { songId, mod } = action.payload;
			const song = selectById(state, songId);
			const original = song.modSettings ?? DEFAULT_MOD_SETTINGS;
			const isModEnabled = !song.modSettings[mod]?.isEnabled;
			return adapter.updateOne(state, { id: songId, changes: { modSettings: deepMerge(original, { [mod]: { isEnabled: isModEnabled } }) } });
		});
		builder.addCase(updateModColor, (state, action) => {
			const { songId, element, color } = action.payload;
			const song = selectById(state, songId);
			const original = song.modSettings.customColors ?? DEFAULT_MOD_SETTINGS.customColors;
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(song.modSettings, { customColors: deepMerge(original, { [element]: color }) }),
				},
			});
		});
		builder.addCase(updateModColorOverdrive, (state, action) => {
			const { songId, element, overdrive } = action.payload;
			const elementOverdriveKey = `${element}Overdrive` as const;
			const song = selectById(state, songId);
			const original = song.modSettings.customColors ?? DEFAULT_MOD_SETTINGS.customColors;
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(song.modSettings, { customColors: deepMerge(original, { [elementOverdriveKey]: overdrive }) }),
				},
			});
		});
		builder.addCase(resetGrid, (state, action) => {
			const { songId } = action.payload;
			const song = selectById(state, songId);
			const original = song.modSettings.mappingExtensions ?? DEFAULT_MOD_SETTINGS.mappingExtensions;
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(song.modSettings, { mappingExtensions: deepMerge(original, { ...DEFAULT_GRID }) }),
				},
			});
		});
		builder.addCase(togglePropertyForSelectedSong, (state, action) => {
			const { songId, property } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, { id: songId, changes: { [property]: !song[property] } });
		});
		builder.addMatcher(isAnyOf(updateGrid, loadGridPreset), (state, action) => {
			const { songId, grid } = action.payload;
			const song = selectById(state, songId);
			const original = song.modSettings.mappingExtensions ?? DEFAULT_MOD_SETTINGS.mappingExtensions;
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(song.modSettings, { mappingExtensions: deepMerge(original, { ...DEFAULT_GRID }, { ...grid }) }),
				},
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
