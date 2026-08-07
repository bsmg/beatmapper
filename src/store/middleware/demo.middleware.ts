import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { addSongFromFile, loadDemoMap } from "$/store/actions";
import type { AppDispatch, AppExtraArgs, RootState } from "$/store/types";

interface Options {
	extra: Pick<AppExtraArgs, "getRouter" | "getToaster">;
}

/** This middleware exists only to load (and possibly manage) the demo song that comes with this app. */
export default function createDemoMiddleware({ extra }: Options) {
	const instance = createListenerMiddleware<RootState, AppDispatch, Options["extra"]>({ extra });

	instance.startListening({
		actionCreator: loadDemoMap,
		effect: async (_, api) => {
			try {
				const blob = await fetch(demoFileUrl).then((response) => response.blob());
				const { songData } = await api.dispatch(addSongFromFile({ file: blob, options: { readonly: true } })).unwrap();

				const router = api.extra.getRouter();
				const songId = songData.id;
				const beatmapId = songData.selectedDifficulty ?? Object.keys(songData.difficultiesById)[0];
				router.navigate({ to: "/edit/$sid/$bid/notes", params: { sid: songId.toString(), bid: beatmapId.toString() } });
			} catch (error) {
				const toaster = api.extra.getToaster();
				toaster?.error({ description: `Could not import map: ${error instanceof Error ? error.message : "See console for more info."}` });
				return console.error(error);
			}
		},
	});

	return instance.middleware;
}
