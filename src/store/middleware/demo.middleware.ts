import { createListenerMiddleware } from "@reduxjs/toolkit";

import { demoFileUrl } from "$/assets";
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
				await api.dispatch(importExistingSong({ file: blob, options: { readonly: true } }));
			}
		},
	});

	return instance.middleware;
}
