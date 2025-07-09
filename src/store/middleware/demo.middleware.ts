import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { getSelectedBeatmap, resolveSongId } from "$/helpers/song.helpers";
import { router } from "$/index";
import { addSongFromFile, loadDemoMap } from "$/store/actions";
import type { RootState } from "$/store/setup";

/**
 * This middleware exists only to load (and possibly manage) the demo song that comes with this app.
 */
export default function createDemoMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: loadDemoMap,
		effect: async (_, api) => {
			const blob = await fetch(demoFileUrl).then((response) => response.blob());
			const { songData } = await api.dispatch(addSongFromFile({ file: blob, options: { readonly: true } })).unwrap();
			const sid = resolveSongId({ name: songData.name });
			const bid = getSelectedBeatmap(songData);
			router.navigate({ to: "/edit/$sid/$bid/notes", params: { sid, bid: bid.toString() } });
		},
	});

	return instance.middleware;
}
