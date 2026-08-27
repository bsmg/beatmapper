import { createDraftSafeSelector, createSelector } from "@reduxjs/toolkit";
import type { HistoryState } from "history-adapter/redux";

import type { RootState } from "$/store/types";

export const createAppSelector = createSelector.withTypes<RootState>();
export const createAppDraftSafeSelector = createDraftSafeSelector.withTypes<RootState>();

export function selectPrevSnapshot<State>(state: HistoryState<State>) {
	return state.past[state.past.length - 1];
}
export function selectNextSnapshot<State>(state: HistoryState<State>) {
	return state.future[state.future.length - 1];
}
