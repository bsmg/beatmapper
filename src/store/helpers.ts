import type { StateWithHistory } from "redux-undo";

import { pick } from "$/utils";
import type { RootState } from "./setup";

export type Snapshot = ReturnType<typeof selectSnapshot>;

export function selectSnapshot<T extends RootState>(state: T) {
	return {
		user: state.user,
		editor: state.editor,
		songs: {
			byId: state.songs.byId,
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
