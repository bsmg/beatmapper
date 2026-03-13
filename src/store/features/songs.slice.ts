import { type AsyncThunkPayloadCreator, createEntityAdapter, createSelector, isAnyOf } from "@reduxjs/toolkit";

import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { deriveEventTracksForEnvironment } from "$/helpers/events.helpers";
import { createAppBeatmap, createAppSong, getColorScheme, getEnvironment, getGridSize, resolveSongId } from "$/helpers/song.helpers";
import { importMapArchiveToFilestore } from "$/services/packaging.service";
import { finishLoadingMap, hydrateSongs, loadGridPreset, startLoadingMap } from "$/store/actions";
import { createSlice } from "$/store/helpers";
import { type App, type BeatmapId, type ColorSchemeKey, type IGrid, ObjectPlacementMode, type SongId } from "$/types";
import { deepAssign } from "$/utils";

const adapter = createEntityAdapter<App.ISong, SongId>({
	selectId: resolveSongId,
	sortComparer: (a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0),
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
			return { title: song.name, subtitle: song.subName, artist: song.artistName };
		}),
		selectBpm: createSelector(selectById, (song) => {
			return song.bpm;
		}),
		selectEditorOffset: createSelector(selectById, (song) => {
			return song.offset;
		}),
		selectEditorOffsetInBeats: createSelector(selectById, (song) => {
			return convertMillisecondsToBeats(song.offset, song.bpm);
		}),
		selectBeatmaps: createSelector(selectById, (song) => {
			return song.difficultiesById;
		}),
		selectAllBeatmaps: createSelector(selectById, (song) => {
			return Object.values(song.difficultiesById);
		}),
		selectBeatmapIds: createSelector(selectById, (song) => {
			return Object.keys(song.difficultiesById);
		}),
		selectBeatmapById: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return song.difficultiesById[beatmapId];
		}),
		selectJumpSpeed: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return song.difficultiesById[beatmapId].noteJumpSpeed;
		}),
		selectJumpOffset: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return song.difficultiesById[beatmapId].startBeatOffset;
		}),
		selectLightshowIdForBeatmap: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId: BeatmapId) => beatmapId], (song, beatmapId) => {
			return song.difficultiesById[beatmapId].lightshowId;
		}),
		selectBeatmapIdsWithLightshowId: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, lightshowId: BeatmapId) => lightshowId], (song, lightshowId) => {
			const beatmaps = Object.entries(song.difficultiesById).filter(([_, x]) => x.lightshowId === lightshowId);
			return beatmaps.map(([id]) => id);
		}),
		selectColorSchemeIds: createSelector(selectById, (song) => {
			return Object.keys(song.colorSchemesById);
		}),
		selectSelectedBeatmap: createSelector(selectById, (song) => {
			return song.selectedDifficulty ?? Object.keys(song.difficultiesById)[0];
		}),
		selectDemo: createSelector(selectById, (song) => {
			return !!song.demo;
		}),
		selectModuleEnabled: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, key: keyof App.IModSettings) => key], (song, key) => {
			return !!song.modSettings[key]?.isEnabled;
		}),
		selectCustomColors: createSelector(selectById, (song) => {
			return { ...song.modSettings.customColors };
		}),
		selectColorScheme: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId?: BeatmapId) => beatmapId], (song, beatmapId) => {
			return getColorScheme(song, beatmapId);
		}),
		selectEventTracksForEnvironment: createSelector([selectById, (_1: ReturnType<typeof adapter.getInitialState>, _2: SongId, beatmapId?: BeatmapId) => beatmapId], (song, beatmapId) => {
			return deriveEventTracksForEnvironment(getEnvironment(song, beatmapId));
		}),
		selectGridSize: createSelector(selectById, (song) => {
			return getGridSize(song);
		}),
		selectPlacementMode: createSelector(selectById, (song) => {
			return song.modSettings.mappingExtensions?.isEnabled ? ObjectPlacementMode.EXTENSIONS : ObjectPlacementMode.NORMAL;
		}),
	},
	reducers: (api) => {
		const fetchContentsFromFile: AsyncThunkPayloadCreator<{ songId: SongId; songData: App.ISong }, { file: File | Blob; options: Parameters<typeof importMapArchiveToFilestore>[1] }> = async (args, api) => {
			try {
				const archive = await args.file.arrayBuffer();
				const songData = await importMapArchiveToFilestore(new Uint8Array(archive), args.options);
				return api.fulfillWithValue({ songId: songData.id, songData: { ...songData, demo: args.options.readonly } });
			} catch (e) {
				return api.rejectWithValue(e);
			}
		};

		return {
			addOne: api.reducer<{ songId: SongId; beatmapId: BeatmapId; songFile: File; coverArtFile: File; songData: Parameters<typeof createAppSong>[0]; beatmapData: Parameters<typeof createAppBeatmap>[0] }>((state, action) => {
				const { songData, beatmapId, beatmapData } = action.payload;
				return adapter.addOne(state, createAppSong({ ...songData, difficultiesById: { [beatmapId]: createAppBeatmap(beatmapData) } }));
			}),
			addOneFromFile: api.asyncThunk(fetchContentsFromFile, {
				fulfilled: (state, action) => {
					const { songData } = action.payload;
					return adapter.upsertOne(state, songData);
				},
			}),
			updateOne: api.reducer<{ songId: SongId; songFile: File | undefined; changes: Partial<App.ISong> }>((state, action) => {
				const { songId: id, changes } = action.payload;
				return adapter.updateOne(state, { id, changes });
			}),
			updateSelectedBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId }>((state, action) => {
				const { songId: id, beatmapId } = action.payload;
				return adapter.updateOne(state, { id, changes: { selectedDifficulty: beatmapId } });
			}),
			removeOne: api.reducer<{ songId: SongId; beatmapIds: BeatmapId[] }>((state, action) => {
				const { songId: id } = action.payload;
				return adapter.removeOne(state, id);
			}),
			addBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId; data: Parameters<typeof createAppBeatmap>[0] }>((state, action) => {
				const { songId, beatmapId, data } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, { difficultiesById: { [beatmapId]: createAppBeatmap({ ...data, environmentName: song.environment }) } }),
				});
			}),
			cloneBeatmap: api.reducer<{ songId: SongId; sourceBeatmapId: BeatmapId; targetBeatmapId: BeatmapId; changes?: Partial<App.IBeatmap> }>((state, action) => {
				const { songId, sourceBeatmapId, targetBeatmapId, changes } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, { difficultiesById: { [targetBeatmapId]: { ...song.difficultiesById[sourceBeatmapId], ...changes } } }),
				});
			}),
			updateBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId; changes: Partial<App.IBeatmap> }>((state, action) => {
				const { songId, beatmapId, changes } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, { difficultiesById: { [beatmapId]: { ...changes } } }),
				});
			}),
			removeBeatmap: api.reducer<{ songId: SongId; beatmapId: BeatmapId }>((state, action) => {
				const { songId, beatmapId } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: {
						difficultiesById: Object.entries(song.difficultiesById).reduce((acc: App.ISong["difficultiesById"], [bid, beatmap]) => {
							if (bid === beatmapId) return acc;
							acc[bid] = beatmap;
							return acc;
						}, {}),
					},
				});
			}),
			updateModuleEnabled: api.reducer<{ songId: SongId; key: keyof App.IModSettings; checked?: boolean }>((state, action) => {
				const { songId, key } = action.payload;
				const song = selectById(state, songId);
				return adapter.updateOne(state, {
					id: songId,
					changes: deepAssign(song, { modSettings: { [key]: { isEnabled: !song.modSettings[key]?.isEnabled } } }),
				});
			}),
			updateCustomColor: api.reducer<{ songId: SongId; key: ColorSchemeKey; value: string | null }>((state, action) => {
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
					changes: deepAssign(song, { modSettings: { mappingExtensions: { ...changes } } }),
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
			const { songId, songData } = action.payload;
			const { lastOpenedAt } = songData;
			return adapter.updateOne(state, { id: songId, changes: { lastOpenedAt } });
		});
		builder.addMatcher(isAnyOf(loadGridPreset), (state, action) => {
			const { songId, grid } = action.payload;
			const song = selectById(state, songId);
			return adapter.updateOne(state, {
				id: songId,
				changes: deepAssign(song, { modSettings: { mappingExtensions: { ...grid } } }),
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
