import type { BeatmapFilestore } from "$/services/file.service";
import { createBeatmapContentsFromState } from "$/services/packaging.service";
import { selectActiveBeatmapId, selectSongById } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import type { SongId } from "$/types";

// A mechanism already exists to back up the Redux state to our persistence layer, so that the state can be rehydrated on return visits.
// The only Redux state persisted is the `songs` reducer; for stuff like what the notes are for the current song, we'll read that from the files saved to disk,
// (stuff like `songName_Info.dat` and `songName_Expert.dat`).
// Whenever redux saves the song list, we should also save all the stuff in the editor-entities reducer by storing them in info files.

// (If this feels overly complicated, and you're wondering why I don't just store _everything_ in redux,
// it's because the user can have dozens or hundreds of songs, and each song can have thousands of notes. It's too much to keep in RAM.
// So I store non-loaded songs to disk, stored in indexeddb. It uses the same mechanism as Redux Storage, but it's treated separately.)

export function save(state: RootState, songId: SongId, filestore: BeatmapFilestore) {
	const song = selectSongById(state, songId);
	const difficulty = selectActiveBeatmapId(state);

	// We only want to autosave when a song is currently selected
	if (!song || !difficulty) {
		return;
	}

	const beatmapContents = createBeatmapContentsFromState(state, song);

	filestore.saveBeatmapFile(song.id, difficulty, beatmapContents).catch((err) => {
		console.error("Could not run backup for beatmap file", err);
	});
}

interface Options {
	filestore: BeatmapFilestore;
}
export function createAutosaveWorker({ filestore }: Options) {
	return {
		save: (state: RootState, songId: SongId) => save(state, songId, filestore),
	};
}
