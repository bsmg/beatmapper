import { serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import type { BeatmapFilestore } from "$/services/file.service";
import { selectBeatmapSerializationOptionsFromState, selectInfoSerializationOptionsFromState } from "$/store/middleware/file.middleware";
import { selectActiveBeatmapId, selectAllEntities, selectBeatmapIdsWithLightshowId, selectLightshowIdForBeatmap, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";

// A mechanism already exists to back up the Redux state to our persistence layer, so that the state can be rehydrated on return visits.
// The only Redux state persisted is the `songs` reducer; for stuff like what the notes are for the current song, we'll read that from the files saved to disk,
// (stuff like `songName_Info.dat` and `songName_Expert.dat`).
// Whenever redux saves the song list, we should also save all the stuff in the editor-entities reducer by storing them in info files.

// (If this feels overly complicated, and you're wondering why I don't just store _everything_ in redux,
// it's because the user can have dozens or hundreds of songs, and each song can have thousands of notes. It's too much to keep in RAM.
// So I store non-loaded songs to disk, stored in indexeddb. It uses the same mechanism as Redux Storage, but it's treated separately.)

export async function save(state: RootState, filestore: BeatmapFilestore, songId: SongId) {
	// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
	const song = selectSongById(state, songId);
	const infoContents = serializeInfoContents(song, selectInfoSerializationOptionsFromState(state, songId));
	await filestore.updateInfoContents(songId, infoContents);

	const beatmapId = selectActiveBeatmapId(state);
	// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
	if (beatmapId) {
		const entities = selectAllEntities(state);
		const { difficulty, lightshow } = serializeBeatmapContents(entities, selectBeatmapSerializationOptionsFromState(state, songId));
		const { contents } = await filestore.updateBeatmapContents(songId, beatmapId, { difficulty, lightshow });

		// we want to copy lightshow data across beatmaps that share the same lightshow id
		const lightshowId = selectLightshowIdForBeatmap(state, songId, beatmapId);
		const beatmapIds = selectBeatmapIdsWithLightshowId(state, songId, lightshowId);

		for (const targetBeatmapId of beatmapIds) {
			await filestore.updateBeatmapContents(songId, targetBeatmapId, { lightshow: contents.lightshow });
		}
	}
}

interface Options {
	filestore: BeatmapFilestore;
}
export function createAutosaveWorker({ filestore }: Options) {
	return {
		save: async (state: RootState, songId: SongId) => await save(state, filestore, songId),
	};
}
