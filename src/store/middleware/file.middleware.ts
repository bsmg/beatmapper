import { createListenerMiddleware } from "@reduxjs/toolkit";
import { createBeatmap } from "bsmap";

import { createAudioDataContentsFromFile } from "$/helpers/audio.helpers";
import { serializeInfoContents } from "$/helpers/packaging.helpers";
import { BeatmapFilestore } from "$/services/file.service";
import { addBeatmap, addSong, copyBeatmap, finishLoadingMap, loadAudioDataContents, loadBeatmapContents, loadSongFile, removeBeatmap, removeSong, startLoadingMap, updateBeatmap } from "$/store/actions";
import { selectBeatmapIdsWithLightshowId, selectBpm, selectDuration, selectEditorOffsetInBeats, selectLightshowIdForBeatmap, selectSelectedBeatmap, selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import { deepAssign } from "$/utils";

interface Options {
	extra: Pick<AppExtraArgs, "getFilestore" | "getAudioContext">;
}

/** This middleware manages file storage concerns. */
export default function createFileMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: startLoadingMap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;

			const state = api.getState();
			const bpm = selectBpm(state, songId);
			const editorOffsetInBeats = selectEditorOffsetInBeats(state, songId);

			await Promise.all([api.dispatch(loadSongFile({ songId })), api.dispatch(loadAudioDataContents({ songId, options: { bpm } })), api.dispatch(loadBeatmapContents({ songId, beatmapId, options: { editorOffsetInBeats } }))]).then(() => {
				api.dispatch(finishLoadingMap({ songId }));
			});
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
			const audioDataContents = await createAudioDataContentsFromFile(songFile, api.extra.getAudioContext(), { bpm: selectBpm(state, songId) });

			const filestore = api.extra.getFilestore();

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
		effect: async (action, api) => {
			const { songId, beatmapIds } = action.payload;

			const filestore = api.extra.getFilestore();

			await filestore.removeAllFilesForSong(songId, beatmapIds);
		},
	});
	instance.startListening({
		actionCreator: addBeatmap,
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;

			const state = api.getState();
			// pull the lightshow id from the source
			const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);

			const filestore = api.extra.getFilestore();
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
			// pull the lightshow id from the source (since we're deriving that data anyway)
			const lightshowId = selectLightshowIdForBeatmap(state, songId, sourceBeatmapId);

			const filestore = api.extra.getFilestore();
			// grab the implicit version and all related collections from the source data
			const { version, difficulty, lightshow, customData } = await filestore.loadBeatmapContents(songId, sourceBeatmapId);
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

				const filestore = api.extra.getFilestore();
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
		effect: async (action, api) => {
			const { songId, beatmapId } = action.payload;

			const filestore = api.extra.getFilestore();
			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			await filestore.removeFile(BeatmapFilestore.resolveFilename(songId, "beatmap", { id: beatmapId }));
		},
	});

	return instance.middleware;
}
