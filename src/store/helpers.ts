import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { StateWithHistory } from "redux-undo";

import type { App } from "$/types";
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

export function createSelectedEntitiesSelector<State, T extends App.IEditorObject>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector(selectAll, (state) => state.filter((x) => x.selected === true));
}
export function createByPositionSelector<State, T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector([selectAll, (_, query: Pick<T, "time" | "posX" | "posY">) => query], (state, { time, posX, posY }) => {
		return state.find((x) => x.time === time && x.posX === posX && x.posY === posY);
	});
}
