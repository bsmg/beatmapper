import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { createBeatmap } from "bsmap";

import { createAudioDataContentsFromFile, deriveWaveformDataFromFile } from "$/helpers/audio.helpers";
import { deserializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { getAppBeatmapFilestore } from "$/setup";
import { addBeatmap, addColorScheme, addSong, copyBeatmap, finishLoadingMap, loadBeatmapEntities, rehydrate, reloadVisualizer, removeBeatmap, removeColorScheme, removeSong, startLoadingMap, updateBeatmap, updateColorScheme, updateCustomColors, updateGridSize, updateModuleEnabled, updateSong } from "$/store/actions";
import { selectBeatmapIdsWithLightshowId, selectBpm, selectDuration, selectEditorOffsetInBeats, selectLightshowIdForBeatmap, selectSelectedBeatmap, selectSongById } from "$/store/selectors";
import type { AppDispatch, RootState } from "$/store/types";
import type { SongId } from "$/types";
import { deepAssign } from "$/utils";

/** This middleware manages file storage concerns. */
export default function createFileMiddleware() {
	const instance = createListenerMiddleware<RootState, AppDispatch>();

	const filestore = getAppBeatmapFilestore();

	instance.startListening({
		actionCreator: rehydrate,
		effect: (action, api) => {
			const { songId, beatmapId } = action.payload;
			api.dispatch(startLoadingMap({ songId, beatmapId }));
		},
	});
	instance.startListening({
		actionCreator: startLoadingMap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			// fetch the metadata for this beatmap from our local store
			const beatmap = await filestore.loadBeatmapContents(songId, beatmapId).then((data) => createBeatmap(data));
			// pull the lightshow data from any beatmap with a matching lightshow id
			const derivedBeatmapId = selectBeatmapIdsWithLightshowId(state, songId, selectLightshowIdForBeatmap(state, songId, beatmapId)).find((x) => x !== beatmapId);

			if (derivedBeatmapId) {
				const { lightshow: sharedLightshow } = await filestore.loadBeatmapContents(songId, derivedBeatmapId);
				beatmap.lightshow = sharedLightshow;
			}
			// deserialize the metadata into editor-compatible wrappers
			const entities = deserializeBeatmapContents(beatmap, {
				editorOffsetInBeats: selectEditorOffsetInBeats(state, songId),
			});

			api.dispatch(loadBeatmapEntities({ ...entities }));
			api.dispatch(finishLoadingMap({ songId: songId, songData: selectSongById(state, songId) }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(finishLoadingMap, updateSong),
		effect: async (action: PayloadAction<{ songId: SongId; songFile?: File }>, api) => {
			const { songId, songFile } = action.payload;

			if (finishLoadingMap.match(action) || songFile) {
				const activeSongFile = songFile ?? (await filestore.loadSongFile(songId));

				await deriveWaveformDataFromFile(activeSongFile).then((waveformData) => {
					return api.dispatch(reloadVisualizer({ duration: waveformData.duration, waveformData: waveformData.toJSON() }));
				});
			}
		},
	});
	instance.startListening({
		actionCreator: addSong,
		effect: async (action, api) => {
			const { songId, beatmapId, songFile, coverArtFile } = action.payload;
			const state = api.getState();

			const infoContents = serializeInfoContents(selectSongById(state, songId), {
				songDuration: selectDuration(state),
			});
			const audioDataContents = await createAudioDataContentsFromFile(songFile, { bpm: selectBpm(state, songId) });

			await Promise.all([
				filestore.saveSongFile(songId, songFile),
				filestore.saveCoverArtFile(songId, coverArtFile),
				filestore.saveInfoContents(songId, deepAssign(infoContents, { version: 4 })),
				filestore.saveAudioDataContents(songId, deepAssign(audioDataContents, { version: 4 })),
				filestore.saveBeatmapContents(
					songId,
					beatmapId,
					createBeatmap({
						version: 4,
						filename: `${beatmapId}.beatmap.dat`,
						lightshowFilename: `${beatmapId}.lightshow.dat`,
					}),
				),
			]);
		},
	});
	instance.startListening({
		actionCreator: removeSong,
		effect: async (action) => {
			const { songId, beatmapIds } = action.payload;
			await filestore.removeAllFilesForSong(songId, beatmapIds);
		},
	});
	instance.startListening({
		actionCreator: addBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;
			const state = api.getState();

			const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);
			// grab the implicit version from the currently selected beatmap, so we can keep all related files on the same version
			const version = await filestore.loadImplicitVersion(songId, selectSelectedBeatmap(state, songId));
			// save it to our destination file
			await filestore.saveBeatmapContents(
				songId,
				beatmapId,
				createBeatmap({
					version: version,
					filename: `${beatmapId}.beatmap.dat`,
					lightshowFilename: `${lightshowId}.lightshow.dat`,
				}),
			);
		},
	});
	instance.startListening({
		actionCreator: copyBeatmap,
		effect: async (action, api) => {
			const { songId, sourceBeatmapId, targetBeatmapId } = action.payload;

			const state = api.getState();
			// grab the implicit version and all related collections from the source data
			const { version, difficulty, lightshow, customData } = await filestore.loadBeatmapContents(songId, sourceBeatmapId);
			// pull the lightshow id from the source (since we're deriving that data anyway)
			const lightshowId = selectLightshowIdForBeatmap(state, songId, sourceBeatmapId);
			// save it to our destination
			await filestore.saveBeatmapContents(
				songId,
				targetBeatmapId,
				createBeatmap({
					version: version,
					filename: `${targetBeatmapId}.beatmap.dat`,
					lightshowFilename: `${lightshowId}.lightshow.dat`,
					difficulty,
					lightshow,
					customData,
				}),
			);
		},
	});
	instance.startListening({
		actionCreator: updateBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId, changes } = action.payload;
			const state = api.getState();

			if ("lightshowId" in changes) {
				const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);
				// reference a beatmap that has the same lightshow id as the one provided via form data
				const derivedBeatmapId = selectBeatmapIdsWithLightshowId(state, songId, lightshowId)[0];
				// extract the lightshow data from the derived beatmap file
				const { lightshow } = await filestore.loadBeatmapContents(songId, derivedBeatmapId);
				// update the beatmap with the new lightshow data
				await filestore.updateBeatmapContents(songId, beatmapId, {
					lightshow,
					// override the lightshow filename with the new id
					lightshowFilename: `${lightshowId}.lightshow.dat`,
				});
			}
		},
	});
	instance.startListening({
		actionCreator: removeBeatmap,
		effect: async (action) => {
			const { songId, beatmapId } = action.payload;
			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId }));
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateSong, addBeatmap, copyBeatmap, updateBeatmap, removeBeatmap, addColorScheme, updateColorScheme, removeColorScheme, updateModuleEnabled, updateCustomColors, updateGridSize),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;

			const state = api.getState();
			// Pull that updated redux state and save it to our Info.dat
			const infoContents = serializeInfoContents(selectSongById(state, songId), {
				songDuration: selectDuration(state),
			});
			// Back up our latest data!
			await filestore.updateInfoContents(songId, infoContents);
		},
	});

	return instance.middleware;
}
