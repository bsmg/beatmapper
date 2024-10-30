import type { StoreEnhancer } from "@reduxjs/toolkit";
import { INDEXEDDB, createInstance } from "localforage";
import type { Reducer } from "redux";
import { type StorageEngine, createLoader, reducer as storageReducer } from "redux-storage";
import debounce from "redux-storage-decorator-debounce";
import { type FilterList, default as filter } from "redux-storage-decorator-filter";

const key = import.meta.env.DEV ? "redux-state-dev" : "redux-state";

/**
 * Store redux state in local-storage, so that the app can be rehydrated when the page is refreshed.
 */
export function enhancer(engine: StorageEngine): StoreEnhancer {
	return (createStore) => {
		return (reducer, initial) => {
			const newReducer = storageReducer(reducer as Reducer) as typeof reducer;
			const store = createStore(newReducer, initial);
			const load = createLoader(engine);
			load(store as Parameters<typeof load>[0]);
			return store;
		};
	};
}

export function createEngine(whitelist: FilterList = []) {
	// This `createEngine` function modified
	// https://raw.githubusercontent.com/mathieudutour/redux-storage-engine-localforage/master/src/index.js
	const storage = createInstance({ name: "BeatMapper redux state" });
	storage.config({ driver: INDEXEDDB, name: "beat-mapper-state" });
	let engine: StorageEngine = {
		async load<T>(): Promise<T> {
			const raw = await storage.getItem<string>(key);
			const result = raw ? JSON.parse(raw) : {};
			return result;
		},
		async save<T>(state: T): Promise<string> {
			const raw = JSON.stringify(state);
			return storage.setItem(key, raw);
		},
	};

	// TODO: Add migrations here, if/when necessary
	// engine = handleMigrations(engine)

	engine = debounce(engine, 250);

	engine = filter(engine, whitelist);

	return engine;
}
