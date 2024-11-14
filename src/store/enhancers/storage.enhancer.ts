import type { Reducer, StoreEnhancer } from "@reduxjs/toolkit";
import { type StorageEngine, createLoader, reducer as storageReducer } from "redux-storage";
import debounce from "redux-storage-decorator-debounce";
import { type FilterList, default as filter } from "redux-storage-decorator-filter";
import type { Storage } from "unstorage";

/** Store redux state in local-storage, so that the app can be rehydrated when the page is refreshed. */
export function storageEnhancer(engine: StorageEngine): StoreEnhancer {
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

interface StorageEngineOptions {
	key: string;
	storage: Storage;
	debounceTime?: number;
	whitelist?: FilterList;
}
export function createStorageEngine({ key, storage, debounceTime, whitelist }: StorageEngineOptions) {
	// This `createEngine` function modified (incorporates unstorage for more flexibility over preferred drivers)
	// https://raw.githubusercontent.com/mathieudutour/redux-storage-engine-localforage/master/src/index.js
	let engine: StorageEngine = {
		async load<T>(): Promise<T> {
			const raw = await storage.getItemRaw<T>(key);
			return raw as T;
		},
		async save<T>(state: T): Promise<T> {
			// @ts-ignore
			await storage.setItemRaw<T>(key, state);
			return state;
		},
	};

	if (debounceTime) engine = debounce(engine, debounceTime);
	if (whitelist) engine = filter(engine, whitelist);

	return engine;
}
