import { asyncThunkCreator, buildCreateSlice, createDraftSafeSelector, type EntityAdapter, type EntityId, type EntityState } from "@reduxjs/toolkit";
import { pick } from "@std/collections/pick";
import type { HistoryState } from "history-adapter/redux";

import type { App } from "$/types";

export const createSlice = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } });

/** @deprecated */
export type Snapshot = ReturnType<typeof selectSnapshot>;

/** @deprecated */
// biome-ignore lint/suspicious/noExplicitAny: only used during migrations
export function selectSnapshot<T extends { [k: string]: any }>(state: T) {
	return {
		user: state.user,
		editor: state.editor,
		songs: {
			byId: state.songs.entities,
		},
		navigation: pick<T, keyof T>(state.navigation, ["snapTo", "beatDepth", "volume", "playNoteTick"]),
	};
}

export function selectPrevSnapshot<State>(state: HistoryState<State>) {
	return state.past[state.past.length - 1];
}
export function selectNextSnapshot<State>(state: HistoryState<State>) {
	return state.future[state.future.length - 1];
}

export function createEditorObjectAdapter<T extends App.IEditorObject, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const { selectAll } = adapter.getSelectors();

	const selectAllSelected = createDraftSafeSelector(selectAll, (state) => state.filter((x) => x.selected === true));

	return {
		getSelectors: () => {
			return { selectAllSelected };
		},
		removeAllSelected: (state: EntityState<T, Id>) => {
			const entities = selectAllSelected(state);
			return adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
		},
		updateAll: (state: EntityState<T, Id>, update: (data: T) => Partial<T>) => {
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: update(x) })),
			);
		},
		updateAllSelected: (state: EntityState<T, Id>, update: (data: T) => Partial<T>) => {
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: update(x) })),
			);
		},
		replaceAllSelected: (state: EntityState<T, Id>, update: (data: T) => Partial<T>) => {
			const entities = selectAllSelected(state);
			adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
			return adapter.addMany(
				state,
				entities.map((x) => ({ ...x, ...update(x) })),
			);
		},
	};
}
