import { configureStore, type DevToolsEnhancerOptions } from "@reduxjs/toolkit";
import { initStateWithPrevTab } from "redux-state-sync";

import { createLazySingleton } from "$/utils";
import { init, tick, updateEventsEditorCursor } from "./actions";
import { createAppEnhancers } from "./enhancers/_setup";
import { default as reducer } from "./features/_setup";
import { createAppMiddleware } from "./middleware/_setup";

// biome-ignore-start assist/source/organizeImports: circular dependencies

import { getRouter } from "$/router";

// biome-ignore-end assist/source/organizeImports: circular dependencies

export async function createAppStore() {
	const devTools: DevToolsEnhancerOptions = {
		name: "Beatmapper",
		actionsDenylist: [tick.type, updateEventsEditorCursor.type],
	};

	const store = configureStore({
		reducer: reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware({ thunk: { extraArgument: { getRouter } } }).concat(createAppMiddleware());
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

export const { get: getAppStore, setup: setupAppStore } = createLazySingleton(createAppStore);
