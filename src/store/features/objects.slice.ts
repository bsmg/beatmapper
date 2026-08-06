import { createDraftSafeSelector, createEntityAdapter, createSelector, createSlice, type EntityId, isAnyOf, type Update } from "@reduxjs/toolkit";
import { type IWrapBombNote, type IWrapColorNote, type IWrapObstacle, mirrorNoteColor, sortObjectFn } from "bsmap";
import { createHistoryAdapter } from "history-adapter/redux";

import { mirrorBaseNoteProperties, mirrorGridObjectProperties, nudgeItem } from "$/helpers/item.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { resolveObstacleId } from "$/helpers/obstacles.helpers";
import { cutSelection, deselectAllEntities, deselectAllEntitiesOfType, leaveEditor, loadBeatmapEntities, mirrorSelection, nudgeSelection, pasteSelection, selectAllEntities, selectAllEntitiesInRange, startLoadingMap } from "$/store/actions";
import { createEditorObjectAdapter, selectNextSnapshot, selectPrevSnapshot } from "$/store/helpers";
import { type App, ObjectType, View } from "$/types";

const notes = createEntityAdapter<App.IWrapEditorObject<IWrapColorNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const bombs = createEntityAdapter<App.IWrapEditorObject<IWrapBombNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const obstacles = createEntityAdapter<App.IWrapEditorObject<IWrapObstacle>, EntityId>({ selectId: resolveObstacleId, sortComparer: sortObjectFn });

const noteSelectors = notes.getSelectors();
const bombSelectors = bombs.getSelectors();
const obstacleSelectors = obstacles.getSelectors();

const { updateAll: updateAllColorNotes, updateAllSelected: updateAllSelectedColorNotes, replaceAllSelected: replaceAllSelectedColorNotes, removeAllSelected: removeAllSelectedColorNotes } = createEditorObjectAdapter(notes);
const { updateAll: updateAllBombNotes, updateAllSelected: updateAllSelectedBombNotes, replaceAllSelected: replaceAllSelectedBombNotes, removeAllSelected: removeAllSelectedBombNotes } = createEditorObjectAdapter(bombs);
const { updateAll: updateAllObstacles, updateAllSelected: updateAllSelectedObstacles, replaceAllSelected: replaceAllSelectedObstacles, removeAllSelected: removeAllSelectedObstacles } = createEditorObjectAdapter(obstacles);

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
					const entities = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
					obstacles.updateMany(
						state.obstacles,
						entities.map((data) => ({ id: obstacles.selectId(data), changes: action.payload.changes })),
					);
				}),
			),
			removeAllSelectedObjects: api.reducer(
				history.undoable((state) => {
					removeAllSelectedColorNotes(state.notes);
					removeAllSelectedBombNotes(state.bombs);
					removeAllSelectedObstacles(state.obstacles);
				}),
			),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			notes.setAll(state.present.notes, action.payload.notes ?? []);
			bombs.setAll(state.present.bombs, action.payload.bombs ?? []);
			obstacles.setAll(state.present.obstacles, action.payload.obstacles ?? []);
		});
		builder.addCase(
			mirrorSelection,
			history.undoable((state, action) => {
				const { axis, grid } = action.payload;
				replaceAllSelectedColorNotes(state.notes, mirrorGridObjectProperties(axis, grid, 0));
				replaceAllSelectedColorNotes(state.notes, mirrorBaseNoteProperties(axis));
				replaceAllSelectedBombNotes(state.bombs, mirrorGridObjectProperties(axis, grid, 0));
				if (axis === "horizontal") {
					replaceAllSelectedObstacles(state.obstacles, mirrorGridObjectProperties(axis, grid, 0));
				}
			}),
		);
		builder.addCase(
			nudgeSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.BEATMAP) return state;
				const { direction, amount } = action.payload;
				updateAllSelectedColorNotes(state.notes, nudgeItem(direction, amount));
				updateAllSelectedBombNotes(state.bombs, nudgeItem(direction, amount));
				updateAllSelectedObstacles(state.obstacles, nudgeItem(direction, amount));
			}),
		);
		builder.addCase(
			cutSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.BEATMAP) return state;
				removeAllSelectedColorNotes(state.notes);
				removeAllSelectedBombNotes(state.bombs);
				removeAllSelectedObstacles(state.obstacles);
			}),
		);
		builder.addCase(
			pasteSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.BEATMAP) return state;
				if (action.payload.data.notes) {
					notes.upsertMany(
						state.notes,
						action.payload.data.notes.map((x) => ({ ...x, selected: true, time: x.time + action.payload.deltaBetweenPeriods })),
					);
				}
				if (action.payload.data.bombs) {
					bombs.upsertMany(
						state.bombs,
						action.payload.data.bombs.map((x) => ({ ...x, selected: true, time: x.time + action.payload.deltaBetweenPeriods })),
					);
				}
				if (action.payload.data.obstacles) {
					obstacles.upsertMany(
						state.obstacles,
						action.payload.data.obstacles.map((x) => ({ ...x, selected: true, time: x.time + action.payload.deltaBetweenPeriods })),
					);
				}
			}),
		);
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			updateAllColorNotes(state.present.notes, () => ({ selected: true }));
			updateAllBombNotes(state.present.bombs, () => ({ selected: true }));
			updateAllObstacles(state.present.obstacles, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			updateAllColorNotes(state.present.notes, () => ({ selected: false }));
			updateAllBombNotes(state.present.bombs, () => ({ selected: false }));
			updateAllObstacles(state.present.obstacles, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			updateAllColorNotes(state.present.notes, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
			updateAllBombNotes(state.present.bombs, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
			updateAllObstacles(state.present.obstacles, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
		});
		builder.addCase(deselectAllEntitiesOfType, (state, action) => {
			switch (action.payload.itemType) {
				case ObjectType.NOTE: {
					updateAllColorNotes(state.present.notes, () => ({ selected: false }));
					break;
				}
				case ObjectType.BOMB: {
					updateAllBombNotes(state.present.bombs, () => ({ selected: false }));
					break;
				}
				case ObjectType.OBSTACLE: {
					updateAllObstacles(state.present.obstacles, () => ({ selected: false }));
					break;
				}
			}
		});
		builder.addMatcher(isAnyOf(startLoadingMap, leaveEditor), () => {
			history.getInitialState({
				notes: notes.getInitialState(),
				bombs: bombs.getInitialState(),
				obstacles: obstacles.getInitialState(),
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
