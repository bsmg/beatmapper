import { type EntityId, type Middleware, createAction, isAction } from "@reduxjs/toolkit";
import type { Storage, StorageValue } from "unstorage";

import { rehydrate } from "$/store/actions";
import type { MaybeDefined } from "$/types";
import { isStrictlyEqual, uniq } from "$/utils";

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

			if (rehydrate.match(action)) {
				dispatch(load());
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

// for entities, we don't know what the keys are ahead of time since they are dynamically referenced in state, so we need to make some adjustments to the logic:

interface EntityStorageObserver<T extends StorageValue, State> extends Omit<StorageObserver<T, State>, "selector"> {
	/** The key selector (selectIds). Used to generate the keys on initialization and observe for new entries to add on hydration. */
	keys: (state: State) => string[];
	/** The entity selector (selectById). */
	selector: (state: State, key: string) => T;
}

export function createEntityStorageActions<T, K extends EntityId>(namespace: string) {
	return {
		/** Runs when all hydrations are complete. */
		load: createAction(`@@STORAGE/LOAD/${namespace}`),
		/** Runs when an observed state is updated. */
		save: createAction(`@@STORAGE/SAVE/${namespace}`, (payload: { key: K; value: T | null }) => {
			return { payload: payload };
		}),
		/** Applies a persisted value into the state. Returns the entry from the storage. */
		hydrate: createAction(`@@STORAGE/HYDRATE/${namespace}`, (payload: Record<K, T>) => {
			return { payload: payload };
		}),
	};
}

interface EntityStorageMiddlewareOptions<T extends StorageValue, State> extends Omit<StorageMiddlewareOptions<State>, "observers"> {
	/** The entity observer. Uses selectors to dynamically define key-value pairs based on an entity state. Pairs nicely with RTK's entity adapters */
	observer: EntityStorageObserver<T, State>;
}
export function createEntityStorageMiddleware<T extends StorageValue, State>({ namespace, observer, storage }: EntityStorageMiddlewareOptions<T, State>): Middleware {
	const { load, save, hydrate } = createEntityStorageActions<T, EntityId>(namespace);
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
				// we don't know the keys ahead of time, but we'll process the ones we already have
				const keys = await storage.getKeys();
				return Promise.all(
					keys.map(async (key) => {
						const { condition: enabled, selector, asRaw } = observer;
						// if the observer is not enabled, abort early
						if (enabled === false) return;
						const value = (asRaw ? await storage.getItemRaw(key) : await storage.getItem(key)) ?? selector(state, key);
						// if the value doesn't exist, it was probably already removed, so we can clear it now
						if (value === undefined) await storage.removeItem(key);
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

			// if we're saving, we don't want to cascade updates in other storage middleware
			// this only really applies when we have two observers watching the same state
			if (isAction(action) && action.type.startsWith("@@STORAGE/HYDRATE")) {
				return next(action);
			}

			next(action);
			const nextState = getState();
			// if the two states aren't equal, time to figure out what changed
			if (!isStrictlyEqual(nextState, state)) {
				// we need to reference old keys in order to remove storage entries for removed entities
				const allKeys = uniq([...observer.keys(nextState), ...observer.keys(state)]);
				return Promise.resolve(
					Object.values(allKeys).reduce(
						(acc: { key: EntityId | undefined; value: T | undefined }, key) => {
							const { condition: enabled, selector, asRaw } = observer;
							// if the observer is not enabled, abort early
							if (enabled === false) return acc;
							const value = selector(nextState, key);
							// only save if the observed state changes
							if (isStrictlyEqual(value, selector(state, key))) return acc;
							// if the value doesn't exist, clear it from storage
							if (value === undefined) {
								storage.removeItem(key.toString());
								return { key, value: undefined };
							}
							if (asRaw) {
								storage.setItemRaw<T>(key, value as MaybeDefined<T>);
							} else {
								storage.setItem<T>(key, value);
							}
							return { key, value };
						},
						{ key: undefined, value: undefined },
					),
				).then(({ key, value }) => {
					// if there was a change, dispatch a save action with the updated field
					if (key) dispatch(save({ key: key, value: value ?? null }));
				});
			}
		};
	};
}
