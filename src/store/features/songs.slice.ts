import { createEntityAdapter, createSelector, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { EnvironmentName } from "bsmap/types";

import { DEFAULT_GRID, DEFAULT_NOTE_JUMP_SPEEDS } from "$/constants";
import { deriveColorSchemeFromEnvironment } from "$/helpers/colors.helpers";
import {
	getAllBeatmaps,
	getBeatmapById,
	getBeatmapIds,
	getBeatmaps,
	getColorScheme,
	getCustomColorsModule,
	getExtensionsModule,
	getGridSize,
	getModSettings,
	getModuleData,
	getSelectedBeatmap,
	getSongLastOpenedAt,
	getSongMetadata,
	isFastWallsEnabled,
	isLightshowEnabled,
	isModuleEnabled,
	isSongReadonly,
	resolveBeatmapId,
	resolveSongId,
} from "$/helpers/song.helpers";
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

const adapter = createEntityAdapter<App.ISong, SongId>({
	selectId: resolveSongId,
	sortComparer: (a, b) => getSongLastOpenedAt(b) - getSongLastOpenedAt(a),
});
const { selectEntities, selectAll, selectIds, selectById } = adapter.getSelectors();

const slice = createSlice({
	name: "songs",
	initialState: adapter.getInitialState(),
	selectors: {
		selectId: (_, model: App.ISong) => adapter.selectId(model),
		selectEntities: selectEntities,
		selectAll: selectAll,
		selectIds: selectIds,
		selectById: selectById,
		selectSongMetadata: createSelector(selectById, (song) => {
			return getSongMetadata(song);
		}),
		selectBeatmaps: createSelector(selectById, (song) => {
			return getBeatmaps(song);
		}),
		selectAllBeatmaps: createSelector(selectById, (song) => {
			return getAllBeatmaps(song);
		}),
		selectBeatmapIds: createSelector(selectById, (song) => {
			return getBeatmapIds(song);
		}),
		selectBeatmapById: createSelector([selectById, (_1, _2, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return getBeatmapById(song, beatmapId);
		}),
		selectLightshowIdForBeatmap: createSelector([selectById, (_1, _2, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			const beatmap = getBeatmapById(song, beatmapId);
			return beatmap.lightshowId;
		}),
		selectBeatmapIdsWithLightshowId: createSelector([selectById, (_1, _2, beatmapId: BeatmapId) => beatmapId], (song, lightshowId) => {
			const beatmaps = getAllBeatmaps(song).filter((x) => x.lightshowId === lightshowId);
			return beatmaps.map((x) => x.beatmapId);
		}),
		selectColorSchemeIds: createSelector(selectById, (song) => {
			return Object.keys(song.colorSchemesById);
		}),
		selectColorScheme: createSelector([selectById, (_1, _2, beatmapId?: BeatmapId) => beatmapId], (song, beatmapId) => {
			return getColorScheme(song, beatmapId);
		}),
		selectSelectedBeatmap: createSelector(selectById, (song) => {
			return getSelectedBeatmap(song);
		}),
		selectIsDemo: createSelector(selectById, (song) => {
			return isSongReadonly(song);
		}),
		selectIsModuleEnabled: createSelector([selectById, (_1, _2, key: keyof App.IModSettings) => key], (song, key) => {
			return isModuleEnabled(song, key);
		}),
		selectIsFastWallsEnabled: createSelector(selectById, (song) => {
			return isFastWallsEnabled(song);
		}),
		selectIsLightshowEnabled: createSelector(selectById, (song) => {
			return isLightshowEnabled(song);
		}),
		selectCustomColors: createSelector(selectById, (song) => {
			return getCustomColorsModule(song);
		}),
		selectGridSize: createSelector(selectById, (song) => {
			return getGridSize(song);
		}),
		selectPlacementMode: createSelector(selectById, (song) => {
			return isModuleEnabled(song, "mappingExtensions") ? ObjectPlacementMode.EXTENSIONS : ObjectPlacementMode.NORMAL;
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
			const { songData, beatmapData } = action.payload;
			const environment = EnvironmentName[0];
			const beatmapId = resolveBeatmapId({ characteristic: beatmapData.characteristic, difficulty: beatmapData.difficulty });
			return adapter.addOne(state, {
				...songData,
				previewStartTime: 12,
				previewDuration: 10,
				environment: environment,
				colorSchemesById: {},
				mapAuthorName: songData.mapAuthorName ?? undefined,
				difficultiesById: {
					[beatmapId]: {
						beatmapId: beatmapId,
						lightshowId: beatmapId,
						characteristic: beatmapData.characteristic,
						difficulty: beatmapData.difficulty,
						noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[beatmapData.difficulty],
						startBeatOffset: 0,
						environmentName: environment,
						colorSchemeName: null,
						mappers: [],
						lighters: [],
					},
				},
				modSettings: {
					customColors: { isEnabled: false, ...deriveColorSchemeFromEnvironment(environment) },
					mappingExtensions: { isEnabled: false, ...DEFAULT_GRID },
				},
			});
		});
		builder.addCase(importExistingSong, (state, action) => {
			const { songData } = action.payload;
			return adapter.upsertOne(state, songData);
		});
		builder.addCase(updateSongDetails, (state, action) => {
			const { songId, songData: fieldsToUpdate } = action.payload;
			return adapter.updateOne(state, { id: songId, changes: fieldsToUpdate });
		});
		builder.addCase(createDifficulty, (state, action) => {
			const { songId, beatmapId, lightshowId, beatmapData: data } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					difficultiesById: deepMerge(getBeatmaps(song), {
						[beatmapId]: {
							beatmapId: beatmapId,
							lightshowId: lightshowId ?? beatmapId,
							characteristic: data.characteristic,
							difficulty: data.difficulty,
							noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[data.difficulty],
							startBeatOffset: 0,
							environmentName: song.environment,
							colorSchemeName: null,
							mappers: [],
							lighters: [],
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
					difficultiesById: deepMerge(getBeatmaps(song), {
						[toBeatmapId]: { ...getBeatmapById(song, fromBeatmapId), beatmapId: toBeatmapId },
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
			const difficultiesById = Object.entries(getBeatmaps(song)).reduce((acc: App.ISong["difficultiesById"], [bid, beatmap]) => {
				if (bid === beatmapId) return acc;
				acc[bid] = beatmap;
				return acc;
			}, {});
			return adapter.updateOne(state, { id: songId, changes: { difficultiesById: difficultiesById } });
		});
		builder.addCase(updateBeatmapMetadata, (state, action) => {
			const { songId, beatmapId, beatmapData } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					difficultiesById: {
						...getBeatmaps(song),
						[beatmapId]: { ...getBeatmapById(song, beatmapId), ...beatmapData },
					},
				},
			});
		});
		builder.addCase(deleteSong, (state, action) => {
			const { songId } = action.payload;
			return adapter.removeOne(state, songId);
		});
		builder.addCase(toggleModForSong, (state, action) => {
			const { songId, mod: key } = action.payload;
			const song = selectById(state, songId);
			const original = getModuleData(song, key);
			const isModEnabled = !!song.modSettings[key]?.isEnabled;
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(getModSettings(song), { [key]: deepMerge(original, { isEnabled: !isModEnabled }) }),
				},
			});
		});
		builder.addCase(updateModColor, (state, action) => {
			const { songId, element, color } = action.payload;
			const song = selectById(state, songId);
			const original = getCustomColorsModule(song);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(getModSettings(song), { customColors: deepMerge(original, { [element]: color }) }),
				},
			});
		});
		builder.addCase(updateModColorOverdrive, (state, action) => {
			const { songId, element, overdrive } = action.payload;
			const elementOverdriveKey = `${element}Overdrive` as const;
			const song = selectById(state, songId);
			const original = getCustomColorsModule(song);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(getModSettings(song), { customColors: deepMerge(original, { [elementOverdriveKey]: overdrive }) }),
				},
			});
		});
		builder.addCase(resetGrid, (state, action) => {
			const { songId } = action.payload;
			const song = selectById(state, songId);
			const original = getExtensionsModule(song);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(getModSettings(song), { mappingExtensions: deepMerge(original, { ...DEFAULT_GRID }) }),
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
			const original = getExtensionsModule(song);
			return adapter.updateOne(state, {
				id: songId,
				changes: {
					modSettings: deepMerge(getModSettings(song), { mappingExtensions: deepMerge(original, { ...grid }) }),
				},
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
