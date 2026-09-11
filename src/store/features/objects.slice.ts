import { createAction, createDraftSafeSelector, createEntityAdapter, createSelector, createSlice, type EntityId, type Update } from "@reduxjs/toolkit";
import { type IWrapBombNote, type IWrapColorNote, type IWrapObstacle, mirrorNoteColor, sortObjectFn } from "bsmap";
import { createHistoryAdapter } from "history-adapter/redux";

import { mirrorBaseNoteProperties, mirrorGridObjectProperties, nudgeItem } from "$/helpers/item.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { createEditorObjectAdapter } from "$/store/helpers/editor.helpers";
import { selectNextSnapshot, selectPrevSnapshot } from "$/store/helpers/selectors";
import { type App, type IGrid, ObjectType, View } from "$/types";
import { deselectAllEntities, leaveEditor, loadBeatmapContents, selectAllEntities, selectAllEntitiesInRange } from "./actions";

const notes = createEntityAdapter<App.IWrapEditorObject<IWrapColorNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const bombs = createEntityAdapter<App.IWrapEditorObject<IWrapBombNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const obstacles = createEntityAdapter<App.IWrapEditorObject<IWrapObstacle>, EntityId>({ selectId: resolveObstacleId, sortComparer: sortObjectFn });

const noteSelectors = notes.getSelectors();
const bombSelectors = bombs.getSelectors();
const obstacleSelectors = obstacles.getSelectors();

const noteReducers = createEditorObjectAdapter(notes);
const bombReducers = createEditorObjectAdapter(bombs);
const obstacleReducers = createEditorObjectAdapter(obstacles);

interface State {
	notes: ReturnType<typeof notes.getInitialState>;
	bombs: ReturnType<typeof bombs.getInitialState>;
	obstacles: ReturnType<typeof obstacles.getInitialState>;
}

const history = createHistoryAdapter<State>({ limit: 100 });

const { selectPresent, selectCanRedo, selectCanUndo } = history.getSelectors();

const slice = createSlice({
	name: "objects",
	initialState: history.getInitialState({
		notes: notes.getInitialState(),
		bombs: bombs.getInitialState(),
		obstacles: obstacles.getInitialState(),
	}),
	selectors: {
		selectCanRedo,
		selectCanUndo,
		selectAllColorNotes: createDraftSafeSelector(selectPresent, (state) => noteSelectors.selectAll(state.notes)),
		selectAllSelectedColorNotes: createDraftSafeSelector(selectPresent, (state) => noteSelectors.selectAll(state.notes).filter((data) => !!data.selected)),
		selectTotalColorNotes: (state) => noteSelectors.selectTotal(state.present.notes),
		selectPastColorNotes: createDraftSafeSelector(selectPrevSnapshot, (state) => noteSelectors.selectAll(state.notes)),
		selectFutureColorNotes: createDraftSafeSelector(selectNextSnapshot, (state) => noteSelectors.selectAll(state.notes)),
		selectAllBombNotes: createDraftSafeSelector(selectPresent, (state) => bombSelectors.selectAll(state.bombs)),
		selectAllSelectedBombNotes: createDraftSafeSelector(selectPresent, (state) => bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected)),
		selectTotalBombNotes: (state) => bombSelectors.selectTotal(state.present.bombs),
		selectPastBombNotes: createDraftSafeSelector(selectPrevSnapshot, (state) => bombSelectors.selectAll(state.bombs)),
		selectFutureBombNotes: createDraftSafeSelector(selectNextSnapshot, (state) => bombSelectors.selectAll(state.bombs)),
		selectAllNotes: createDraftSafeSelector(selectPresent, (state) => [...noteSelectors.selectAll(state.notes), ...bombSelectors.selectAll(state.bombs)]),
		selectAllObstacles: createDraftSafeSelector(selectPresent, (state) => obstacleSelectors.selectAll(state.obstacles)),
		selectAllSelectedObstacles: createDraftSafeSelector(selectPresent, (state) => obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected)),
		selectTotalObstacles: (state) => obstacleSelectors.selectTotal(state.present.obstacles),
		selectPastObstacles: createDraftSafeSelector(selectPrevSnapshot, (state) => obstacleSelectors.selectAll(state.obstacles)),
		selectFutureObstacles: createDraftSafeSelector(selectNextSnapshot, (state) => obstacleSelectors.selectAll(state.obstacles)),
		selectSelectedObjects: createSelector(selectPresent, (state) => {
			const notes = noteSelectors.selectAll(state.notes).filter((data) => !!data.selected);
			const bombs = bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected);
			const obstacles = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
			return {
				notes: notes.length > 0 ? notes : undefined,
				bombs: bombs.length > 0 ? bombs : undefined,
				obstacles: obstacles.length > 0 ? obstacles : undefined,
			};
		}),
		selectAnySelectedObjects: createSelector(selectPresent, (state) => {
			const notes = noteSelectors.selectAll(state.notes).filter((data) => !!data.selected);
			const bombs = bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected);
			const obstacles = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
			return notes.length + bombs.length + obstacles.length > 0;
		}),
	},
	reducers: (api) => {
		return {
			undo: history.undo,
			redo: history.redo,
			clearHistory: history.clearHistory,
			addColorNote: api.reducer<IWrapColorNote>(
				history.undoable((state, action) => {
					notes.upsertOne(state.notes, action.payload);
				}),
			),
			updateColorNote: api.reducer<{ id: EntityId; changes: Partial<IWrapColorNote> }>(
				history.undoable((state, action) => {
					notes.updateOne(state.notes, { id: action.payload.id, changes: action.payload.changes });
				}),
			),
			mirrorColorNote: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					const data = noteSelectors.selectById(state.notes, action.payload.id);
					notes.updateOne(state.notes, { id: action.payload.id, changes: { color: mirrorNoteColor(data.color) } });
				}),
			),
			removeColorNote: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					notes.removeOne(state.notes, action.payload.id);
				}),
			),
			selectColorNote: api.reducer<{ id: EntityId }>((state, action) => {
				notes.updateOne(state.present.notes, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectColorNote: api.reducer<{ id: EntityId }>((state, action) => {
				notes.updateOne(state.present.notes, { id: action.payload.id, changes: { selected: false } });
			}),
			addBombNote: api.reducer<IWrapBombNote>(
				history.undoable((state, action) => {
					bombs.upsertOne(state.bombs, action.payload);
				}),
			),
			removeBombNote: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					bombs.removeOne(state.bombs, action.payload.id);
				}),
			),
			selectBombNote: api.reducer<{ id: EntityId }>((state, action) => {
				bombs.updateOne(state.present.bombs, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectBombNote: api.reducer<{ id: EntityId }>((state, action) => {
				bombs.updateOne(state.present.bombs, { id: action.payload.id, changes: { selected: false } });
			}),
			addObstacle: api.reducer<IWrapObstacle>(
				history.undoable((state, action) => {
					obstacles.upsertOne(state.obstacles, action.payload);
				}),
			),
			updateObstacle: api.reducer<Update<IWrapObstacle, EntityId>>(
				history.undoable((state, action) => {
					obstacles.updateOne(state.obstacles, action.payload);
				}),
			),
			removeObstacle: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					obstacles.removeOne(state.obstacles, action.payload.id);
				}),
			),
			selectObstacle: api.reducer<{ id: EntityId }>((state, action) => {
				obstacles.updateOne(state.present.obstacles, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectObstacle: api.reducer<{ id: EntityId }>((state, action) => {
				obstacles.updateOne(state.present.obstacles, { id: action.payload.id, changes: { selected: false } });
			}),
			updateAllSelectedObstacles: api.reducer<{ changes: Partial<IWrapObstacle> }>(
				history.undoable((state, action) => {
					obstacleReducers.updateAllSelected(state.obstacles, () => action.payload.changes);
				}),
			),
			upsertObjects: api.reducer<Partial<App.IBeatmapEntities>>(
				history.undoable((state, action) => {
					if (action.payload.notes) {
						notes.upsertMany(state.notes, action.payload.notes);
					}
					if (action.payload.bombs) {
						bombs.upsertMany(state.bombs, action.payload.bombs);
					}
					if (action.payload.obstacles) {
						obstacles.upsertMany(state.obstacles, action.payload.obstacles);
					}
				}),
			),
			mirrorAllSelectedObjects: api.reducer<{ axis: "horizontal" | "vertical"; grid?: IGrid }>(
				history.undoable((state, action) => {
					const { axis, grid } = action.payload;
					noteReducers.replaceAllSelected(state.notes, mirrorGridObjectProperties(axis, grid, 0));
					noteReducers.replaceAllSelected(state.notes, mirrorBaseNoteProperties(axis));
					bombReducers.replaceAllSelected(state.bombs, mirrorGridObjectProperties(axis, grid, 0));
					if (axis === "horizontal") {
						obstacleReducers.replaceAllSelected(state.obstacles, mirrorGridObjectProperties(axis, grid, 0));
					}
				}),
			),
			nudgeAllSelectedObjects: api.reducer<{ direction: "forwards" | "backwards"; amount: number }>(
				history.undoable((state, action) => {
					const { direction, amount } = action.payload;
					noteReducers.updateAllSelected(state.notes, nudgeItem(direction, amount));
					bombReducers.updateAllSelected(state.bombs, nudgeItem(direction, amount));
					obstacleReducers.updateAllSelected(state.obstacles, nudgeItem(direction, amount));
				}),
			),
			removeAllSelectedObjects: api.reducer(
				history.undoable((state) => {
					noteReducers.removeAllSelected(state.notes);
					bombReducers.removeAllSelected(state.bombs);
					obstacleReducers.removeAllSelected(state.obstacles);
				}),
			),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapContents.fulfilled, (state, action) => {
			notes.setAll(state.present.notes, action.payload.entities.notes ?? []);
			bombs.setAll(state.present.bombs, action.payload.entities.bombs ?? []);
			obstacles.setAll(state.present.obstacles, action.payload.entities.obstacles ?? []);
		});
		builder.addCase(leaveEditor, () => {
			return history.getInitialState({
				notes: notes.getInitialState(),
				bombs: bombs.getInitialState(),
				obstacles: obstacles.getInitialState(),
			});
		});
		builder.addCase(selectAllEntities, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			noteReducers.updateAll(state.present.notes, () => ({ selected: true }));
			bombReducers.updateAll(state.present.bombs, () => ({ selected: true }));
			obstacleReducers.updateAll(state.present.obstacles, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			noteReducers.updateAll(state.present.notes, () => ({ selected: false }));
			bombReducers.updateAll(state.present.bombs, () => ({ selected: false }));
			obstacleReducers.updateAll(state.present.obstacles, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			noteReducers.updateAll(state.present.notes, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
			bombReducers.updateAll(state.present.bombs, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
			obstacleReducers.updateAll(state.present.obstacles, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
		});
		builder.addCase(deselectAllObjectsOfType, (state, action) => {
			switch (action.payload.itemType) {
				case ObjectType.NOTE: {
					noteReducers.updateAll(state.present.notes, () => ({ selected: false }));
					break;
				}
				case ObjectType.BOMB: {
					bombReducers.updateAll(state.present.bombs, () => ({ selected: false }));
					break;
				}
				case ObjectType.OBSTACLE: {
					obstacleReducers.updateAll(state.present.obstacles, () => ({ selected: false }));
					break;
				}
			}
		});
		builder.addDefaultCase((state) => state);
	},
});

export const {
	selectCanUndo: selectObjectsCanUndo,
	selectCanRedo: selectObjectsCanRedo,
	selectAllColorNotes,
	selectAllSelectedColorNotes,
	selectTotalColorNotes,
	selectPastColorNotes,
	selectFutureColorNotes,
	selectAllBombNotes,
	selectAllSelectedBombNotes,
	selectTotalBombNotes,
	selectPastBombNotes,
	selectFutureBombNotes,
	selectAllNotes,
	selectAllObstacles,
	selectAllSelectedObstacles,
	selectTotalObstacles,
	selectPastObstacles,
	selectFutureObstacles,
	selectSelectedObjects,
	selectAnySelectedObjects,
} = slice.getSelectors(slice.selectSlice);

export const { undo: undoObjects, redo: redoObjects, clearHistory: clearObjectHistory, upsertObjects, mirrorAllSelectedObjects, nudgeAllSelectedObjects, removeAllSelectedObjects } = slice.actions;
export const { addColorNote, updateColorNote, selectColorNote, deselectColorNote, removeColorNote } = slice.actions;
export const { addBombNote, selectBombNote, deselectBombNote, removeBombNote } = slice.actions;
export const { addObstacle, updateObstacle, selectObstacle, deselectObstacle, updateAllSelectedObstacles, removeObstacle } = slice.actions;

export const deselectAllObjectsOfType = createAction("deselectAllObjectsOfType", (args: { itemType: ObjectType }) => {
	return { payload: { ...args } };
});

export default slice;
