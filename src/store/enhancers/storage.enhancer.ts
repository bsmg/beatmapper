import { type LegacyStorageSchema, createDriver } from "$/services/storage.service";
import type { StoreEnhancer } from "@reduxjs/toolkit";
import type { Reducer } from "redux";
import { type StorageEngine, createLoader, reducer as storageReducer } from "redux-storage";
import debounce from "redux-storage-decorator-debounce";
import { type FilterList, default as filter } from "redux-storage-decorator-filter";
import { createStorage } from "unstorage";

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
	// This `createEngine` function modified (incorporates unstorage for more flexibility over preferred drivers)
	// https://raw.githubusercontent.com/mathieudutour/redux-storage-engine-localforage/master/src/index.js
	const driver = createDriver<LegacyStorageSchema>({
		name: "beat-mapper-state",
		version: 2,
		async upgrade(idb, current, next, tx) {
			await idb.createStore("keyvaluepairs", tx);
			// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
			await idb.removeStore("local-forage-detect-blob-support", tx);
		},
	});
	const storage = createStorage({ driver: driver({ name: "keyvaluepairs" }) });
	let engine: StorageEngine = {
		async load<T>(): Promise<T> {
			const raw = await storage.getItemRaw<string>(key);
			const result = raw ? JSON.parse(raw) : {};
			return result;
		},
		async save<T>(state: T): Promise<string> {
			const raw = JSON.stringify(state);
			await storage.setItemRaw(key, raw);
			return raw;
		},
	};

	// TODO: Add migrations here, if/when necessary
	// engine = handleMigrations(engine)

	engine = debounce(engine, 250);

	engine = filter(engine, whitelist);

	return engine;
}
