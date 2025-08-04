import { type EntityAdapter, type EntityId, type EntityState, type PayloadAction, type ReducerCreators, asyncThunkCreator, buildCreateSlice, createDraftSafeSelector } from "@reduxjs/toolkit";
import type { StateWithHistory } from "redux-undo";

import type { resolveNoteId } from "$/helpers/notes.helpers";
import type { App } from "$/types";
import { pick } from "$/utils";

export const createSlice = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } });

export type Snapshot = ReturnType<typeof selectSnapshot>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function selectSnapshot(state: any) {
	return {
		user: state.user,
		editor: state.editor,
		songs: {
			byId: state.songs.entities,
		},
		navigation: pick<Record<string, any>, string>(state.navigation, ["snapTo", "beatDepth", "volume", "playNoteTick"]),
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
export function createGridObjectSelector<State, T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector([selectAll, (_, query: Pick<T, "time" | "posX" | "posY">) => query], (state, { time, posX, posY }) => {
		return state.find((x) => x.time === time && x.posX === posX && x.posY === posY);
	});
}
export function createEventSelector<State, T extends Pick<App.IBasicEvent, "time" | "type">>(selectAll: (state: State) => T[]) {
	return createDraftSafeSelector([selectAll, (_, query: Pick<T, "time" | "type">) => query], (state, { time, type }) => {
		return state.find((x) => x.time === time && x.type === type);
	});
}

export function createActionsForNoteEntityAdapter<T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(api: ReducerCreators<EntityState<T, EntityId>>, adapter: EntityAdapter<T, EntityId>) {
	const { selectAll } = adapter.getSelectors();
	const selectByPosition = createGridObjectSelector(selectAll);
	type NotePayloadAction<T extends {}> = PayloadAction<{ query: Parameters<typeof resolveNoteId>[0] } & T>;
	return {
		updateOne: api.reducer((state, action: NotePayloadAction<{ changes: Partial<T> }>) => {
			const { query, changes } = action.payload;
			const match = selectByPosition(state, query);
			if (!match) return state;
			return adapter.updateOne(state, { id: adapter.selectId(match), changes });
		}),
	};
}
