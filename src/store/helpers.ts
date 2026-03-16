import { asyncThunkCreator, buildCreateSlice, type CaseReducer, createDraftSafeSelector, type EntityAdapter, type EntityId, type EntityState, type PayloadAction, type WritableDraft } from "@reduxjs/toolkit";
import { pick } from "@std/collections/pick";
import type { EnvironmentName, IWrapBaseNote, IWrapBaseObject } from "bsmap";
import type { StateWithHistory } from "redux-undo";

import { isTrackGroupable, type resolveEventId, resolveGroupTrackIds, resolveTrackIdForEvent } from "$/helpers/events.helpers";
import type { resolveNoteId } from "$/helpers/notes.helpers";
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

export function selectHistory<T, R, State>(snapshotSelector: (state: T) => StateWithHistory<State>["past" | "future"], entitiesSelector: (snapshot: ReturnType<typeof snapshotSelector>[0]) => R) {
	return (state: T) => {
		const snapshots = snapshotSelector(state);
		const mostRecentSnapshot = snapshots[snapshots.length - 1];
		return entitiesSelector(mostRecentSnapshot);
	};
}

export function createEditorObjectSelectors<T extends App.IEditorObject, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const selectors = adapter.getSelectors();

	return {
		selectAllSelected: createDraftSafeSelector(selectors.selectAll, (state) => state.filter((x) => x.selected === true)),
	};
}
export function createEditorObjectReducers<T extends App.IEditorObject, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const { selectAll } = adapter.getSelectors();
	const { selectAllSelected } = createEditorObjectSelectors(adapter);

	return {
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

export function createEventSelectors<T extends Pick<App.IBasicEvent, "time">, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const { selectAll } = adapter.getSelectors();

	const selectAllForTrackBeforeBeat = createDraftSafeSelector([selectAll, (_, query: { trackId: number; beforeBeat: number }) => query], (state, { trackId, beforeBeat }) => {
		return state.filter((x) => resolveTrackIdForEvent(x) === trackId && x.time < beforeBeat);
	});

	return {
		selectAllForTrack: createDraftSafeSelector([selectAll, (_, trackId: number) => trackId], (state, trackId) => {
			return state.filter((x) => resolveTrackIdForEvent(x) === trackId);
		}),
		createEventSelector: <Value>(selector: (data: T) => Value | undefined, fallback: Value) => {
			return createDraftSafeSelector(selectAllForTrackBeforeBeat, (state) => {
				return state[state.length - 1] ? (selector(state[state.length - 1]) ?? fallback) : fallback;
			});
		},
	};
}

export function createGridObjectReducerFactory<T extends Pick<IWrapBaseNote, "time" | "posX" | "posY">, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const selectors = adapter.getSelectors();

	const selectByQuery = createDraftSafeSelector([selectors.selectAll, (_, query: Pick<T, "time" | "posX" | "posY">) => query], (state, { time, posX, posY }) => {
		return state.find((x) => x.time === time && x.posX === posX && x.posY === posY);
	});

	return <P>(callback: (data: T, state: WritableDraft<EntityState<T, Id>>, action: PayloadAction<P>) => EntityState<T, Id>): CaseReducer<EntityState<T, Id>, PayloadAction<{ query: Parameters<typeof resolveNoteId>[0] } & P>> => {
		return (state, action) => {
			const { query } = action.payload;
			const match = selectByQuery(state, query);
			if (!match) return state;
			return callback(query as T, state, action);
		};
	};
}
export function createEventReducerFactory<T extends Pick<IWrapBaseObject, "time">, Id extends EntityId>(adapter: EntityAdapter<T, Id>) {
	const selectors = adapter.getSelectors();

	const selectByQuery = createDraftSafeSelector([selectors.selectAll, (_, query: Pick<T, "time">) => query], (state, query) => {
		return state.find((x) => x.time === query.time && resolveTrackIdForEvent(x) === resolveTrackIdForEvent(query));
	});

	return <P>(
		callback: (data: { match: T | undefined; trackId: number }, state: WritableDraft<EntityState<T, Id>>, action: PayloadAction<P & { environment: EnvironmentName }>) => EntityState<T, Id>,
	): CaseReducer<EntityState<T, Id>, PayloadAction<{ query: Parameters<typeof resolveEventId>[0]; environment: EnvironmentName; areLasersLocked?: boolean } & P>> => {
		return (state, action) => {
			const { query, environment, areLasersLocked } = action.payload;
			const match = selectByQuery(state, query);
			const trackId = resolveTrackIdForEvent(query);
			callback({ match, trackId }, state, action);
			if (areLasersLocked && isTrackGroupable(trackId, environment)) {
				const groupTrackIds = resolveGroupTrackIds(trackId, environment);
				for (const mirrorTrackId of groupTrackIds) {
					// Important: if the side lasers are "locked" we need to mimic this event from the left laser to the right laser.
					callback({ match, trackId: mirrorTrackId }, state, action);
				}
			}
		};
	};
}
