import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { getRouter } from "$/router";
import { getAppToaster } from "$/setup";
import { addSongFromFile, loadDemoMap } from "$/store/actions";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";

/** This middleware exists only to load (and possibly manage) the demo song that comes with this app. */
export default function createDemoMiddleware() {
	const instance = createListenerMiddleware<RootState, AppDispatch, AppExtraArgs>({
		extra: { getRouter },
	});

	const toaster = getAppToaster();

	instance.startListening({
		actionCreator: loadDemoMap,
		effect: async (_, api) => {
			const router = api.extra.getRouter();

			try {
				const blob = await fetch(demoFileUrl).then((response) => response.blob());
				const { songId, songData } = await api.dispatch(addSongFromFile({ file: blob, options: { readonly: true } })).unwrap();
				const beatmapId = songData.selectedDifficulty ?? Object.keys(songData.difficultiesById)[0];
				router.navigate({ to: "/edit/$sid/$bid/notes", params: { sid: songId.toString(), bid: beatmapId.toString() } });
			} catch (error) {
				toaster?.error({ description: `Could not import map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return instance.middleware;
}
