import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { StateWithHistory } from "redux-undo";

import type { IEditorObject } from "$/types";
import { pick } from "$/utils";
import type { RootState } from "./setup";

export type Snapshot = ReturnType<typeof selectSnapshot>;

export function selectSnapshot<T extends RootState>(state: T) {
	return {
		user: state.user,
		editor: state.editor,
		songs: {
			byId: state.songs.entities,
		},
		navigation: pick(state.navigation, "snapTo", "beatDepth", "volume", "playNoteTick"),
	};
}

export function selectHistory<T, R, State>(snapshotSelector: (state: T) => StateWithHistory<State>["past" | "future"], entitiesSelector: (snapshot: ReturnType<typeof snapshotSelector>[0]) => R) {
	return (state: T) => {
		const snapshots = snapshotSelector(state);
		const mostRecentSnapshot = snapshots[snapshots.length - 1];
		return entitiesSelector(mostRecentSnapshot);
	};
}

export function createSelectedEntitiesSelector<State, T extends IEditorObject>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector(selectAll, (state) => state.filter((x) => x.selected === true));
}
export function createByPositionSelector<State, T extends { beatNum: number; colIndex: number; rowIndex: number }>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector([selectAll, (_, query: { beatNum: number; colIndex: number; rowIndex: number }) => query], (state, { beatNum, colIndex, rowIndex }) => {
		return state.find((x) => x.beatNum === beatNum && x.colIndex === colIndex && x.rowIndex === rowIndex);
	});
}
