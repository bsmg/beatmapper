import type { StateWithHistory } from "redux-undo";

export function selectHistory<T, R, State>(snapshotSelector: (state: T) => StateWithHistory<State>["past" | "future"], entitiesSelector: (snapshot: ReturnType<typeof snapshotSelector>[0]) => R) {
	return (state: T) => {
		const snapshots = snapshotSelector(state);
		const mostRecentSnapshot = snapshots[snapshots.length - 1];
		return entitiesSelector(mostRecentSnapshot);
	};
}
