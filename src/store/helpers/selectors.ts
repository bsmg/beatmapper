import type { HistoryState } from "history-adapter/redux";

export function selectPrevSnapshot<State>(state: HistoryState<State>) {
	return state.past[state.past.length - 1];
}
export function selectNextSnapshot<State>(state: HistoryState<State>) {
	return state.future[state.future.length - 1];
}
