import { createListenerMiddleware, isAnyOf, type ListenerEffectAPI, type PayloadAction } from "@reduxjs/toolkit";

import { serializeBeatmapContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { leaveEditor, saveBeatmapContents, updateBeatmap, updateSong } from "$/store/actions";
import { selectBeatmapEntities, selectBeatmapIds, selectBeatmapIdsWithLightshowId, selectDuration, selectEditorOffsetInBeats, selectLightshowIdForBeatmap, selectSelectedBeatmap, selectSongById } from "$/store/selectors";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";
import type { App, BeatmapId, SongId } from "$/types";

// A mechanism already exists to back up the Redux state to our persistence layer, so that the state can be rehydrated on return visits.
// The only Redux state persisted is the `songs` reducer; for stuff like what the notes are for the current song, we'll read that from the files saved to disk,
// (stuff like `songName_Info.dat` and `songName_Expert.dat`).
// Whenever redux saves the song list, we should also save all the stuff in the editor-entities reducer by storing them in info files.

// (If this feels overly complicated, and you're wondering why I don't just store _everything_ in redux,
// it's because the user can have dozens or hundreds of songs, and each song can have thousands of notes. It's too much to keep in RAM.
// So I store non-loaded songs to disk, stored in indexeddb. It uses the same mechanism as Redux Storage, but it's treated separately.)

async function save(api: ListenerEffectAPI<RootState, AppDispatch, Pick<AppExtraArgs, "getFilestore" | "getToaster">>, songId: SongId, beatmapId: BeatmapId | null, entities?: Partial<App.IBeatmapEntities>) {
	const state = api.getState();
	const filestore = api.extra.getFilestore();

	// If we have an actively-loaded song, we want to first persist that song so that we download the very latest stuff.
	const infoContents = serializeInfoContents(selectSongById(state, songId), {
		songDuration: selectDuration(state),
	});

	await filestore.updateInfoContents(songId, infoContents);

	// Note that we can also download files from the homescreen, so there will be no selected difficulty in this case.
	if (beatmapId === selectSelectedBeatmap(state, songId)) {
		const activeEntities = entities ?? selectBeatmapEntities(state);

		const { difficulty, lightshow, customData } = serializeBeatmapContents(activeEntities, {
			version: await filestore.loadImplicitVersion(songId, beatmapId),
			editorOffsetInBeats: selectEditorOffsetInBeats(state, songId),
		});

		await filestore.updateBeatmapContents(songId, beatmapId, { difficulty, lightshow, customData });

		// we want to copy custom data across all beatmaps
		const beatmapIds = selectBeatmapIds(state, songId);

		for (const targetBeatmapId of beatmapIds) {
			await filestore.updateBeatmapContents(songId, targetBeatmapId, {
				difficulty: { customData: difficulty.customData },
				lightshow: { customData: lightshow.customData },
				customData,
			});
		}

		// we want to copy lightshow data across beatmaps that share the same lightshow id
		const sharedBeatmapIds = selectBeatmapIdsWithLightshowId(state, songId, selectLightshowIdForBeatmap(state, songId, beatmapId));

		for (const targetBeatmapId of sharedBeatmapIds) {
			await filestore.updateBeatmapContents(songId, targetBeatmapId, { lightshow });
		}
	}

	const toaster = api.extra.getToaster();

	if (toaster) {
		const id = `${beatmapId ? `${songId}/${beatmapId}` : songId}`;
		return toaster?.success({ id: `save/${id}`, description: `Contents for "${id}" has been saved.` });
	}
}

interface Options {
	extra: Pick<AppExtraArgs, "getFilestore" | "getToaster">;
}

export default function createBackupMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		matcher: isAnyOf(saveBeatmapContents),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			const beatmapId = selectSelectedBeatmap(api.getState(), songId);
			await save(api, songId, beatmapId);
		},
	});
	instance.startListening({
		matcher: isAnyOf(leaveEditor),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId; entities: Partial<App.IBeatmapEntities> }>, api) => {
			const { songId, beatmapId, entities } = action.payload;
			await save(api, songId, beatmapId, entities);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateSong),
		effect: async (action: PayloadAction<{ songId: SongId }>, api) => {
			const { songId } = action.payload;
			await save(api, songId, null);
		},
	});
	instance.startListening({
		matcher: isAnyOf(updateBeatmap),
		effect: async (action: PayloadAction<{ songId: SongId; beatmapId: BeatmapId }>, api) => {
			const { songId, beatmapId } = action.payload;
			await save(api, songId, beatmapId);
		},
	});

	return instance.middleware;
}
