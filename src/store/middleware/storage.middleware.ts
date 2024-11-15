import { type Middleware, createAction, isAction } from "@reduxjs/toolkit";
import type { Storage, StorageValue } from "unstorage";

import { isStrictlyEqual } from "$/utils";

// the common architecture other packages use for persisting redux state is to clone the entire state object into storage and then hydrate the redux store all at once.
// this is a really bad means of persistence for many reasons:
// - any retroactive updates made to the redux state can break functionality, especially if there are no migrations in place to convert the stored state object
// - any updates to the persisted state have to be made all at once on every dispatch, even if the persisted state isn't actually changed between updates

// this new middleware (based off `redux-persistent`) implements a more flexible and performant architecture for reading state changes:
// you define observers that map a selector to a key-value storage entry, and update the entry when any action updates that observed state
// - this gives us full control over what we want to persist, how we want to store it, and how those values are hydrated back into the app state
// - migrations are much easier to manage, since we can make direct updates to the selectors as needed without breaking references in storage.
// - state updates are easier to verify, since the save action is only dispatched when the persisted state *actually* changes instead of every dispatched action

// the only downside: we need to define a dedicated case reducer to hydrate values for each slice.
// bit annoying, but this ensures we have more control for how we want to plug state back into the app, which imo is a fair tradeoff.

export interface StorageObserver<T extends StorageValue, State> {
	/** The state to listen for. */
	selector: (state: State) => T;
	/** Allows you to control whether this observer is active. */
	condition?: boolean;
	/** Will serialize the raw values directly to/from storage, rather than interpolating them as strings. Only useful if the driver supports non-serial values in storage,such as arrays, blobs, etc. */
	asRaw?: boolean;
}

export type StorageObserverMap<State> = Record<string, StorageObserver<StorageValue, State>>;

export function createStorageActions<State, T extends StorageObserverMap<State> = StorageObserverMap<State>>(namespace: string) {
	return {
		/** Runs when all hydrations are complete. */
		load: createAction(`@@STORAGE/LOAD/${namespace}`),
		/** Runs when an observed state is updated. */
		save: createAction(`@@STORAGE/SAVE/${namespace}`, (payload: { key: keyof T; value: ReturnType<T[keyof T]["selector"]> | null }) => {
			return { payload: payload };
		}),
		/** Applies a persisted value into the state. Returns the entry from the storage. */
		hydrate: createAction(`@@STORAGE/HYDRATE/${namespace}`, (payload: Partial<{ [Key in keyof T]: ReturnType<T[Key]["selector"]> }>) => {
			return { payload: payload };
		}),
	};
}

export interface StorageMiddlewareOptions<State, T extends StorageObserverMap<State> = StorageObserverMap<State>> {
	/** The scope of the middleware. Useful when you have multiple storage middleware defined. */
	namespace: string;
	/** The preferred storage engine for the middleware. */
	storage: Storage;
	/** A map of storage observers. Each key in the map will be the key used in the storage engine. */
	observers: T;
}
export function createStorageMiddleware<State, T extends StorageObserverMap<State> = StorageObserverMap<State>>({ namespace, observers, storage }: StorageMiddlewareOptions<State, T>): Middleware {
	const { load, save, hydrate } = createStorageActions(namespace);
	let processing = false;
	return ({ dispatch, getState }) => {
		return (next) => async (action) => {
			const state = getState();
			// we don't want to be observing changes until the state is initialized
			if (processing) {
				return next(action);
			}

			if (load.match(action)) {
				processing = true;
				return Promise.all(
					Object.keys(observers).map(async (key) => {
						const { condition: enabled, selector, asRaw } = observers[key];
						// if the observer is not enabled, abort early
						if (enabled === false) return;
						const value = (asRaw ? await storage.getItemRaw(key) : await storage.getItem(key)) ?? selector(state);
						// if the entry doesn't exist, autogenerate it from the initialized state
						if (!(await storage.hasItem(key))) {
							if (asRaw) await storage.setItemRaw(key, value);
							await storage.setItem(key, value);
						}
						// dispatch a hydrate action with the injected value
						return dispatch(hydrate({ [key]: value }));
					}),
				).then((dispatched) => {
					processing = false;
					// don't dispatch the load action if nothing was actually loaded
					if (!dispatched) return;
					// once all processing is complete, dispatch the load action to trigger side-effects
					return next(action);
				});
			}

			// we don't want to cascade storage updates in other instances of this middleware
			// this only really applies when we have two observers watching the same state
			if (isAction(action) && action.type.startsWith("@@STORAGE")) {
				return next(action);
			}

			next(action);
			const nextState = getState();
			// if the two states aren't equal, time to figure out what changed
			if (!isStrictlyEqual(nextState, state)) {
				return Promise.resolve(
					Object.keys(observers).reduce(
						(acc: { key: string | undefined; value: StorageValue | undefined }, key) => {
							const { condition: enabled, selector, asRaw } = observers[key];
							// if the observer is not enabled, abort early
							if (enabled === false) return acc;
							const value = selector(nextState);
							// only save if the observed state changes
							if (isStrictlyEqual<StorageValue>(value, selector(state))) return acc;
							// if the value is undefined, clear the value
							if (value === undefined || value === "") {
								storage.removeItem(key);
								return { key, value: null };
							}
							if (asRaw) {
								storage.setItemRaw(key, value);
							} else {
								storage.setItem(key, value);
							}
							return { key, value };
						},
						{ key: undefined, value: undefined },
					),
				).then(({ key, value }) => {
					// if there was a change, dispatch a save action with the updated field
					if (key) dispatch(save({ key, value: value ?? null }));
				});
			}
		};
	};
}
