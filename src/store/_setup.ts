import { configureStore, type DevToolsEnhancerOptions } from "@reduxjs/toolkit";
import { initStateWithPrevTab } from "redux-state-sync";

import { init, tick, updateEventsEditorCursor } from "./actions";
import { createAppEnhancers } from "./enhancers/_setup";
import { default as reducer } from "./features/_setup";
import { createAppMiddleware } from "./middleware/_setup";
import type { AppExtraArgs } from "./types";

interface Options {
	extraArgument: AppExtraArgs;
}

export async function createAppStore({ extraArgument }: Options) {
	const devTools: DevToolsEnhancerOptions = {
		name: "Beatmapper",
		actionsDenylist: [tick.type, updateEventsEditorCursor.type],
	};

	const store = configureStore({
		reducer: reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware({ thunk: { extraArgument } }).concat(createAppMiddleware({ extraArgument }));
		},
		enhancers: (getDefaultEnhancers) => {
			return getDefaultEnhancers().concat(createAppEnhancers());
		},
	});

	await store.hydrate().then(() => {
		store.dispatch(init());
	});

	initStateWithPrevTab(store);

	return store;
}
