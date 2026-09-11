import type { Store, StoreEnhancer, UnknownAction } from "@reduxjs/toolkit";
import { distinct } from "@std/collections/distinct";
import { createStorage, type Driver, type StorageValue } from "unstorage";

import { withFluxStandardMeta } from "$/store/utils/guards.utils";
import type { MaybeDefined } from "$/types/vendor";

const isHydrationAction = withFluxStandardMeta((meta) => {
	return "hydrate" in meta && typeof meta.hydrate === "boolean" && meta.hydrate === true;
});

export interface StorageStrategy<TState, TValue = StorageValue> {
	getKeys: (prevState: TState, nextState: TState) => string[];
	getValue: (state: TState, key: string) => TValue;
	onHydrate: (store: Store, data: Record<string, StorageValue>) => void;
	asRaw?: boolean;
}

export function createStorageEnhancer<TState>(driver: Driver, { getKeys, getValue, onHydrate, asRaw }: StorageStrategy<TState>): StoreEnhancer<{ hydrate: () => Promise<void> }> {
	const storage = createStorage({ driver });

	function read<T extends StorageValue>(key: string): Promise<T> {
		return (asRaw ? storage.getItemRaw(key) : storage.getItem(key)) as Promise<T>;
	}
	function write<T extends StorageValue>(key: string, value: T) {
		if (value === null || value === undefined) {
			storage.removeItem(key);
		} else {
			asRaw ? storage.setItemRaw(key, value as MaybeDefined<T>) : storage.setItem(key, value);
		}
	}

	return (next) => (reducer, preloadedState) => {
		const store = next(reducer, preloadedState);

		let isHydrating = false;
		let lastState = store.getState() as TState;

		async function hydrate() {
			if (isHydrating) return;
			isHydrating = true;

			try {
				const initialState = store.getState() as TState;

				const currentKeys = getKeys(initialState, initialState);
				const storageKeys = currentKeys.length ? currentKeys : await storage.getKeys();

				const dataToHydrate: Record<string, StorageValue> = {};
				// for keys that have updated
				const tasks = storageKeys.map(async (key) => {
					const initialValue = getValue(initialState, key);
					const storageValue = await read(key);
					// for the initial hydration step, dispatch the observer's slice updater action
					if (storageValue !== null && storageValue !== undefined) {
						// if the stored value does not match the initial value, queue it for hydration
						if (JSON.stringify(storageValue) !== JSON.stringify(initialValue)) {
							dataToHydrate[key] = storageValue;
						}
					} else {
						// seed storage using the initial state from the reducer
						write(key, initialValue);
					}
				});
				// safely intercept and chain the upstream enhancer's hydrate logic if it exists
				if (store && "hydrate" in store && typeof store.hydrate === "function") {
					tasks.push(store.hydrate());
				}
				// resolve any downstream hydration tasks
				await Promise.all(tasks);
				// trigger hydration step for entries that have observed changes between states
				if (Object.keys(dataToHydrate).length > 0) {
					onHydrate(store, dataToHydrate);
				}
				// when hydration is complete, set a fresh value to use for future comparison
				lastState = store.getState() as TState;
			} finally {
				isHydrating = false;
			}
		}

		return {
			...store,
			hydrate: hydrate,
			dispatch: (action) => {
				if (isHydrationAction(action)) {
					// run the hydration step if we manually rehydrate the app
					hydrate();
					return store.dispatch(action);
				}

				const result = store.dispatch(action);
				// don't start observing new changes until the state is initialized
				if (isHydrating) return result;

				const nextState = store.getState() as TState;
				// if the state hasn't changed, we don't need to go any further
				if (nextState === lastState) return result;

				// aggregate keys across both states to determine what was changed
				for (const key of getKeys(lastState, nextState)) {
					const prevValue = getValue(lastState, key);
					const nextValue = getValue(nextState, key);
					// perform the update only when the observed value has actually changed
					if (prevValue !== nextValue) {
						write(key, nextValue);
					}
				}

				lastState = nextState;
				return result;
			},
		};
	};
}

interface IKeyValueStorageObserver<TValue, TState> {
	selectValue: (s: TState) => TValue;
	hydrateValue: (v: TValue) => UnknownAction;
}
export function createKeyValueStorageStrategy<TShape extends { [key: string]: StorageValue }, TState = TShape extends { [key: string]: IKeyValueStorageObserver<unknown, infer S> } ? S : never>(observers: { [key in keyof TShape]: IKeyValueStorageObserver<TShape[key], TState> }): StorageStrategy<TState> {
	const keys = Object.keys(observers);

	return {
		asRaw: false,
		getKeys: () => keys,
		getValue: (state, key) => {
			return observers[key].selectValue(state);
		},
		onHydrate: (store, data) => {
			for (const [key, value] of Object.entries(data)) {
				store.dispatch(observers[key].hydrateValue(value as TShape[string]));
			}
		},
	};
}

interface IEntityStorageObserver<TValue, TState> {
	selectIds: (s: TState) => string[];
	selectById: (s: TState, id: string) => TValue;
	hydrateEntities: (data: Record<string, TValue>) => UnknownAction;
}
export function createEntityStorageStrategy<TValue, TState>(observer: IEntityStorageObserver<TValue, TState>): StorageStrategy<TState, TValue> {
	return {
		asRaw: true,
		getKeys: (prevState, nextState) => {
			return prevState === nextState ? [] : distinct([...observer.selectIds(prevState), ...observer.selectIds(nextState)]);
		},
		getValue: (state, key) => {
			return observer.selectById(state, key);
		},
		onHydrate: (store, data) => {
			store.dispatch(observer.hydrateEntities(data as Record<string, TValue>));
		},
	};
}

export function createEnumerableStorageObserver<TValue, TState>(entries: { [s: PropertyKey]: TValue }, { selectValue, hydrateValue }: IKeyValueStorageObserver<TValue, TState>): IKeyValueStorageObserver<number, TState> {
	const values = Object.values(entries);
	return {
		selectValue: (state) => values.indexOf(selectValue(state)),
		hydrateValue: (index) => hydrateValue(values[index]),
	};
}
