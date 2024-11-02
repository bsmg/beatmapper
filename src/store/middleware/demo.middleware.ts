import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { processImportedMap } from "$/services/packaging.service";
import { importExistingSong, loadDemoMap } from "$/store/actions";
import { getIsNewUser } from "$/store/selectors";
import type { RootState } from "$/store/setup";

/**
 * This middleware exists only to load (and possibly manage) the demo song that comes with this app.
 */
export default function createDemoMiddleware() {
	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: loadDemoMap,
		effect: async (_, api) => {
			// If this is a brand-new user, they won't have the demo song at all
			const state = api.getState();
			const isNewUser = getIsNewUser(state);
			if (isNewUser) {
				const res = await fetch(demoFileUrl);
				const blob = await res.blob();
				const songData = await processImportedMap(blob, []);
				songData.demo = true;
				await api.dispatch(importExistingSong({ songData }));
				// TODO: Should pull data from demoSong
				window.location.href = "/edit/only-now/Normal/notes";
			}
		},
	});

	return instance.middleware;
}
