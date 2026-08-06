import { createDraftSafeSelector, type EntityAdapter, type EntityId, type EntityState } from "@reduxjs/toolkit";

import type { App } from "$/types";

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
