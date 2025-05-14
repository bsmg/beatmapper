import { createListenerMiddleware } from "@reduxjs/toolkit";

import { serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { getBeatmaps } from "$/helpers/song.helpers";
import type { BeatmapFilestore } from "$/services/file.service";
import { zipFiles } from "$/services/packaging.service";
import { downloadMapFiles } from "$/store/actions";
import { selectActiveBeatmapId, selectAllBasicEvents, selectAllEntities, selectBeatmapIdsWithLightshowId, selectLightshowIdForBeatmap, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { BeatmapId, SongId } from "$/types";
import { selectBeatmapSerializationOptionsFromState, selectInfoSerializationOptionsFromState } from "./file.middleware";

async function saveLightshowDataToAllDifficulties(state: RootState, filestore: BeatmapFilestore, songId: SongId, lightshowId: BeatmapId) {
	// we only want to copy lightshow data across beatmaps that share the same lightshow id
	const beatmapIds = selectBeatmapIdsWithLightshowId(state, songId, lightshowId);

	const entities = {
		events: selectAllBasicEvents(state),
	};

	for (const beatmapId of beatmapIds) {
		const { lightshow } = serializeBeatmapContents(entities, selectBeatmapSerializationOptionsFromState(state, songId));
		await filestore.updateBeatmapContents(songId, beatmapId, { lightshow });
	}
}

interface Options {
	filestore: BeatmapFilestore;
}
export default function createPackagingMiddleware({ filestore }: Options) {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: downloadMapFiles,
		effect: async (action, api) => {
			const { songId, version } = action.payload;
			const state = api.getState();

			// Pull that updated redux state and save it to our Info.dat
			const song = selectSongById(state, songId);
			const info = serializeInfoContents(song, selectInfoSerializationOptionsFromState(state, songId));
			// Back up our latest data!
			await filestore.updateInfoContents(songId, info);

			// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
			// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
			const beatmapId = selectActiveBeatmapId(state);
			if (beatmapId) {
				const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);

				const entities = selectAllEntities(state);

				const { difficulty, lightshow } = serializeBeatmapContents(entities, selectBeatmapSerializationOptionsFromState(state, songId));
				await filestore.updateBeatmapContents(songId, beatmapId, { difficulty, lightshow });

				// We also want to share events between all difficulties that share the same lightshow id.
				// Copy the events currently in state to the matching non-loaded beatmaps.
				await saveLightshowDataToAllDifficulties(state, filestore, songId, lightshowId);
			}

			// Next, I need to fetch all relevant files from disk.
			const [songFile, coverArtFile] = await Promise.all([await filestore.loadSongFile(songId), await filestore.loadCoverArtFile(songId)]);

			await zipFiles(filestore, {
				version: version ?? null,
				contents: {
					songId: songId,
					beatmapsById: getBeatmaps(song),
					songFile,
					coverArtFile,
				},
			});
		},
	});

	return instance.middleware;
}
