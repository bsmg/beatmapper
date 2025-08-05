import { type AsyncThunkPayloadCreator, createEntityAdapter, createSelector, isAnyOf } from "@reduxjs/toolkit";
import { NoteJumpSpeed } from "bsmap";
import { type CharacteristicName, type DifficultyName, EnvironmentName } from "bsmap/types";

import { DEFAULT_GRID } from "$/constants";
import { deriveColorSchemeFromEnvironment } from "$/helpers/colors.helpers";
import { getAllBeatmaps, getBeatmapById, getBeatmapIds, getBeatmaps, getColorScheme, getCustomColorsModule, getGridSize, getSelectedBeatmap, getSongLastOpenedAt, getSongMetadata, isModuleEnabled, isSongReadonly, resolveBeatmapId, resolveSongId } from "$/helpers/song.helpers";
import { processImportedMap } from "$/services/packaging.service";
import { finishLoadingMap, hydrateSongs, loadGridPreset, startLoadingMap } from "$/store/actions";
import { createSlice } from "$/store/helpers";
import { type App, type BeatmapId, type ColorSchemeKey, type IGrid, ObjectPlacementMode, type RequiredKeys, type SongId } from "$/types";
import { deepAssign } from "$/utils";

const adapter = createEntityAdapter<App.ISong, SongId>({
	selectId: resolveSongId,
	sortComparer: (a, b) => getSongLastOpenedAt(b) - getSongLastOpenedAt(a),
});
const { selectEntities, selectAll, selectIds, selectById } = adapter.getSelectors();

const fetchContentsFromFile: AsyncThunkPayloadCreator<{ songId: SongId; songData: App.ISong }, { file: File | Blob; options: Parameters<typeof processImportedMap>[1] }> = async (args, api) => {
	try {
		const { readonly } = args.options;
		const archive = await args.file.arrayBuffer();
		const songData = await processImportedMap(new Uint8Array(archive), args.options);
		const songId = resolveSongId({ name: songData.name });
		return api.fulfillWithValue({ songId, songData: { ...songData, demo: readonly } });
	} catch (e) {
		return api.rejectWithValue(e);
	}
};

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
		selectBeatmapById: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return getBeatmapById(song, beatmapId);
		}),
		selectLightshowIdForBeatmap: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			const beatmap = getBeatmapById(song, beatmapId);
			return beatmap.lightshowId;
		}),
		selectBeatmapIdsWithLightshowId: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, lightshowId: BeatmapId) => lightshowId], (song, lightshowId) => {
			const beatmaps = Object.entries(getBeatmaps(song)).filter(([_, x]) => x.lightshowId === lightshowId);
			return beatmaps.map(([id]) => id);
		}),
		selectColorSchemeIds: createSelector(selectById, (song) => {
			return Object.keys(song.colorSchemesById);
		}),
		selectColorScheme: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId?: BeatmapId) => beatmapId], (song, beatmapId) => {
			return getColorScheme(song, beatmapId);
		}),
		selectSelectedBeatmap: createSelector(selectById, (song) => {
			return getSelectedBeatmap(song);
		}),
		selectDemo: createSelector(selectById, (song) => {
			return isSongReadonly(song);
		}),
		selectModuleEnabled: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, key: keyof App.IModSettings) => key], (song, key) => {
			return isModuleEnabled(song, key);
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
	reducers: (api) => {
		return {
			addOne: api.preparedReducer(
				(args: Pick<App.ISong, "name" | "subName" | "artistName" | "bpm" | "offset"> & { username: string; songId: SongId; beatmapId: BeatmapId; songFile: File; coverArtFile: File; selectedCharacteristic: CharacteristicName; selectedDifficulty: DifficultyName }) => {
					const { songId, songFile, coverArtFile, selectedCharacteristic, selectedDifficulty, username, ...rest } = args;
					const mappers = username !== "" ? [username] : [];
					return {
						payload: {
							songId: songId,
							songData: { ...rest },
							beatmapId: resolveBeatmapId({ characteristic: selectedCharacteristic, difficulty: selectedDifficulty }),
							beatmapData: { characteristic: selectedCharacteristic, difficulty: selectedDifficulty, mappers, lighters: mappers },
							songFile,
							coverArtFile,
							username,
						},
					};
				},
				(state, action) => {
					const { songData, songFile, coverArtFile, beatmapId, beatmapData } = action.payload;
					return adapter.addOne(state, {
						...songData,
						songFilename: songFile.name,
						coverArtFilename: coverArtFile.name,
						previewStartTime: 12,
						previewDuration: 10,
						environment: EnvironmentName[0],
						colorSchemesById: {},
						difficultiesById: {
							[beatmapId]: {
								...beatmapData,
								lightshowId: beatmapId,
								noteJumpSpeed: NoteJumpSpeed.FallbackNJS[beatmapData.difficulty],
								startBeatOffset: 0,
								environmentName: EnvironmentName[0],
								colorSchemeName: null,
							},
						},
						modSettings: {
							customColors: { isEnabled: false, ...deriveColorSchemeFromEnvironment(EnvironmentName[0]) },
							mappingExtensions: { isEnabled: false, ...DEFAULT_GRID },
						},
					});
				},
			),
			addOneFromFile: api.asyncThunk(fetchContentsFromFile, {
				fulfilled: (state, action) => {
					const { songData } = action.payload;
					return adapter.upsertOne(state, songData);
				},
			}),
			updateOne: api.reducer<{ songId: SongId; changes: Partial<App.ISong> }>((state, action) => {
				const { songId: id, changes } = action.payload;
				return adapter.updateOne(state, { id, changes });
			}),
			updateSelectedBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId }>((state, action) => {
				const { songId, beatmapId } = action.payload;
				return adapter.updateOne(state, { id: songId, changes: { selectedDifficulty: beatmapId } });
			}),
			removeOne: api.reducer<{ id: SongId; beatmapIds: BeatmapId[] }>((state, action) => {
				const { id } = action.payload;
				return adapter.removeOne(state, id);
			}),
			addBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId; data: RequiredKeys<Partial<App.IBeatmap>, "characteristic" | "difficulty">; username: string }>((state, action) => {
				const { songId, beatmapId, data, username } = action.payload;
				const song = selectById(state, songId);
				const mappers = username !== "" ? [username] : [];
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, {
						difficultiesById: {
							[beatmapId]: {
								lightshowId: data.lightshowId ?? beatmapId,
								characteristic: data.characteristic,
								difficulty: data.difficulty,
								noteJumpSpeed: NoteJumpSpeed.FallbackNJS[data.difficulty],
								startBeatOffset: 0,
								environmentName: song.environment,
								colorSchemeName: null,
								mappers: mappers,
								lighters: mappers,
							},
						},
					}),
				});
			}),
			cloneBeatmap: api.reducer<{ songId: SongId; sourceBeatmapId: BeatmapId; targetBeatmapId: BeatmapId; changes?: Partial<App.IBeatmap> }>((state, action) => {
				const { songId, sourceBeatmapId, targetBeatmapId, changes } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, {
						difficultiesById: {
							[targetBeatmapId]: { ...getBeatmapById(song, sourceBeatmapId), ...changes },
						},
					}),
				});
			}),
			updateBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId; changes: Partial<App.IBeatmap> }>((state, action) => {
				const { songId, beatmapId, changes } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, {
						difficultiesById: {
							[beatmapId]: { ...changes },
						},
					}),
				});
			}),
			removeBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId }>((state, action) => {
				const { songId, beatmapId } = action.payload;
				const song = selectById(state, songId);
				const difficultiesById = Object.entries(getBeatmaps(song)).reduce((acc: App.ISong["difficultiesById"], [bid, beatmap]) => {
					if (bid === beatmapId) return acc;
					acc[bid] = beatmap;
					return acc;
				}, {});
				return adapter.updateOne(state, { id: songId, changes: { difficultiesById: difficultiesById } });
			}),
			updateModuleEnabled: api.reducer<{ songId: SongId; key: keyof App.IModSettings; checked?: boolean }>((state, action) => {
				const { songId, key } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, {
						modSettings: {
							[key]: { isEnabled: !song.modSettings[key]?.isEnabled },
						},
					}),
				});
			}),
			updateCustomColor: api.reducer<{ songId: SongId; key: ColorSchemeKey; value?: string }>((state, action) => {
				const { songId, key: element, value: color } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, { modSettings: { customColors: { [element]: color } } }),
				});
			}),
			updateGridSize: api.reducer<{ songId: SongId; changes: Partial<IGrid> }>((state, action) => {
				const { songId, changes } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, {
						modSettings: {
							mappingExtensions: { ...changes },
						},
					}),
				});
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(hydrateSongs, (state, action) => {
			const byId = action.payload;
			return adapter.upsertMany(state, Object.values(byId));
		});
		builder.addCase(startLoadingMap, (state, action) => {
			const { songId, beatmapId } = action.payload;
			return adapter.updateOne(state, { id: songId, changes: { selectedDifficulty: beatmapId } });
		});
		builder.addCase(finishLoadingMap, (state, action) => {
			const {
				songId,
				songData: { lastOpenedAt },
			} = action.payload;
			return adapter.updateOne(state, { id: songId, changes: { lastOpenedAt } });
		});
		builder.addMatcher(isAnyOf(loadGridPreset), (state, action) => {
			const { songId, grid } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: deepAssign(song, {
					modSettings: {
						mappingExtensions: { ...grid },
					},
				}),
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
