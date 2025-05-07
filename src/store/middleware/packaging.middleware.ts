import { createListenerMiddleware } from "@reduxjs/toolkit";

import type { BeatmapFilestore } from "$/services/file.service";
import { zipFiles } from "$/services/packaging.service";
import { downloadMapFiles } from "$/store/actions";
import { selectActiveBeatmapId, selectAllBasicEvents, selectAllEntities, selectBeatmapById, selectBeatmapIds, selectDuration, selectIsModuleEnabled, selectOffsetInBeats, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";

async function saveEventsToAllDifficulties(state: RootState, songId: SongId, filestore: BeatmapFilestore) {
	const editorOffsetInBeats = selectOffsetInBeats(state, songId);
	const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

	const entities = {
		events: selectAllBasicEvents(state),
	};

	const beatmapIds = selectBeatmapIds(state, songId);

	for (const beatmapId of beatmapIds) {
		const beatmap = selectBeatmapById(state, songId, beatmapId);

		await filestore.updateBeatmapContents(songId, beatmap.beatmapId, beatmap.lightshowId, entities, {
			serializationOptions: {
				editorOffsetInBeats,
				extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
			},
			deserializationOptions: {
				editorOffsetInBeats,
				extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
			},
		});
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
			const { songId, version = 4 } = action.payload;
			const state = api.getState();
			const duration = selectDuration(state);
			const editorOffsetInBeats = selectOffsetInBeats(state, songId);
			const isExtensionsEnabled = selectIsModuleEnabled(state, songId, "mappingExtensions");

			const song = selectSongById(state, songId);

			// Persist the Info.dat and the currently-edited difficulty.
			await filestore.updateInfoContents(songId, song, {
				serializationOptions: { songDuration: duration ? duration / 1000 : undefined },
				deserializationOptions: {},
			});

			// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
			// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
			const beatmapId = selectActiveBeatmapId(state);
			if (beatmapId) {
				const beatmap = selectBeatmapById(state, songId, beatmapId);

				const entities = selectAllEntities(state);

				await filestore.updateBeatmapContents(songId, beatmap.beatmapId, beatmap.lightshowId, entities, {
					serializationOptions: {
						editorOffsetInBeats,
						extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
					},
					deserializationOptions: {
						editorOffsetInBeats,
						extensionsProvider: isExtensionsEnabled ? "mapping-extensions" : undefined,
					},
				});
				// We also want to share events between all difficulties.
				// Copy the events currently in state to the non-loaded beatmaps.
				await saveEventsToAllDifficulties(state, songId, filestore);
			}

			// Next, I need to fetch all relevant files from disk.
			const [songFile, coverArtFile] = await Promise.all([await filestore.loadFile<Blob>(song.songFilename), await filestore.loadFile<Blob>(song.coverArtFilename)]);

			await zipFiles(version, filestore, {
				song,
				songDuration: duration ? duration / 1000 : undefined,
				songFile,
				coverArtFile,
			});
		},
	});

	return instance.middleware;
}
