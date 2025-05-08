import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
import { processImportedMap } from "$/services/packaging.service";
import { importExistingSong, loadDemoMap } from "$/store/actions";
import { selectIsNew } from "$/store/selectors";
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
			const isNewUser = selectIsNew(state);
			if (isNewUser) {
				const res = await fetch(demoFileUrl);
				const blob = await res.blob();
				const songData = await processImportedMap(blob, { readonly: true }).then((data) => {
					api.dispatch(importExistingSong({ songData: data }));
					return data;
				});
				window.location.href = `/edit/${songData.id}/${songData.selectedDifficulty}/notes`;
			}
		},
	});

	return instance.middleware;
}
