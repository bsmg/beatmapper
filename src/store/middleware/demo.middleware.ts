import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { getSelectedBeatmap } from "$/helpers/song.helpers";
import { getRouter } from "$/router";
import { getAppToaster } from "$/setup";
import { addSongFromFile, loadDemoMap } from "$/store/actions";
import type { RootState } from "$/store/setup";

/**
 * This middleware exists only to load (and possibly manage) the demo song that comes with this app.
 */
export default function createDemoMiddleware() {
	const instance = createListenerMiddleware<RootState>();
	const router = getRouter();
	const toaster = getAppToaster();

	instance.startListening({
		actionCreator: loadDemoMap,
		effect: async (_, api) => {
			try {
				const blob = await fetch(demoFileUrl).then((response) => response.blob());
				const { songId: sid, songData } = await api.dispatch(addSongFromFile({ file: blob, options: { readonly: true } })).unwrap();
				const bid = getSelectedBeatmap(songData);
				router.navigate({ to: "/edit/$sid/$bid/notes", params: { sid: sid.toString(), bid: bid.toString() } });
			} catch (e) {
				if (!(e instanceof Error)) return;
				toaster?.error({ description: `${e.message}` });
			}
		},
	});

	return instance.middleware;
}
