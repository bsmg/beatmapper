import { createAction, createDraftSafeSelector, createEntityAdapter, createSelector, createSlice, type EntityId, type Update } from "@reduxjs/toolkit";
import { type IWrapArc, type IWrapBaseObject, type IWrapBombNote, type IWrapChain, type IWrapColorNote, type IWrapObstacle, mirrorNoteColor, SliderMidAnchorMode, sortObjectFn } from "bsmap";
import { createHistoryAdapter } from "history-adapter/redux";

import { mirrorBaseNoteProperties, mirrorGridObjectProperties, nudgeItem } from "$/helpers/item.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { isObstacle, resolveObstacleId } from "$/helpers/obstacles.helpers";
import { isArc, isChain, resolveSliderId } from "$/helpers/sliders.helpers";
import { createEditorObjectAdapter } from "$/store/helpers/editor.helpers";
import { selectNextSnapshot, selectPrevSnapshot } from "$/store/helpers/selectors";
import { type App, type IGrid, ObjectType, View } from "$/types";
import { cycle } from "$/utils";
import { deselectAllEntities, leaveEditor, loadBeatmapContents, selectAllEntities, selectAllEntitiesInRange } from "./actions";

const notes = createEntityAdapter<App.IWrapEditorObject<IWrapColorNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const bombs = createEntityAdapter<App.IWrapEditorObject<IWrapBombNote>, EntityId>({ selectId: resolveNoteId, sortComparer: sortObjectFn });
const obstacles = createEntityAdapter<App.IWrapEditorObject<IWrapObstacle>, EntityId>({ selectId: resolveObstacleId, sortComparer: sortObjectFn });
const arcs = createEntityAdapter<App.IWrapEditorObject<IWrapArc>, EntityId>({ selectId: resolveSliderId, sortComparer: sortObjectFn });
const chains = createEntityAdapter<App.IWrapEditorObject<IWrapChain>, EntityId>({ selectId: resolveSliderId, sortComparer: sortObjectFn });

const noteSelectors = notes.getSelectors();
const bombSelectors = bombs.getSelectors();
const obstacleSelectors = obstacles.getSelectors();
const arcSelectors = arcs.getSelectors();
const chainSelectors = chains.getSelectors();

const noteReducers = createEditorObjectAdapter(notes);
const bombReducers = createEditorObjectAdapter(bombs);
const obstacleReducers = createEditorObjectAdapter(obstacles);
const arcReducers = createEditorObjectAdapter(arcs);
const chainReducers = createEditorObjectAdapter(chains);

interface State {
	notes: ReturnType<typeof notes.getInitialState>;
	bombs: ReturnType<typeof bombs.getInitialState>;
	obstacles: ReturnType<typeof obstacles.getInitialState>;
	arcs: ReturnType<typeof arcs.getInitialState>;
	chains: ReturnType<typeof chains.getInitialState>;
}

const history = createHistoryAdapter<State>({ limit: 100 });

const { selectPresent, selectCanRedo, selectCanUndo } = history.getSelectors();

const slice = createSlice({
	name: "objects",
	initialState: history.getInitialState({
		notes: notes.getInitialState(),
		bombs: bombs.getInitialState(),
		obstacles: obstacles.getInitialState(),
		arcs: arcs.getInitialState(),
		chains: chains.getInitialState(),
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
		selectAllArcs: createDraftSafeSelector(selectPresent, (state) => arcSelectors.selectAll(state.arcs)),
		selectAllSelectedArcs: createDraftSafeSelector(selectPresent, (state) => arcSelectors.selectAll(state.arcs).filter((data) => !!data.selected)),
		selectTotalArcs: (state) => arcSelectors.selectTotal(state.present.arcs),
		selectPastArcs: createDraftSafeSelector(selectPrevSnapshot, (state) => arcSelectors.selectAll(state.arcs)),
		selectFutureArcs: createDraftSafeSelector(selectNextSnapshot, (state) => arcSelectors.selectAll(state.arcs)),
		selectAllChains: createDraftSafeSelector(selectPresent, (state) => chainSelectors.selectAll(state.chains)),
		selectAllSelectedChains: createDraftSafeSelector(selectPresent, (state) => chainSelectors.selectAll(state.chains).filter((data) => !!data.selected)),
		selectTotalChains: (state) => chainSelectors.selectTotal(state.present.chains),
		selectPastChains: createDraftSafeSelector(selectPrevSnapshot, (state) => chainSelectors.selectAll(state.chains)),
		selectFutureChains: createDraftSafeSelector(selectNextSnapshot, (state) => chainSelectors.selectAll(state.chains)),
		selectSelectedObjects: createSelector(selectPresent, (state) => {
			const notes = noteSelectors.selectAll(state.notes).filter((data) => !!data.selected);
			const bombs = bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected);
			const obstacles = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
			const arcs = arcSelectors.selectAll(state.arcs).filter((data) => !!data.selected);
			const chains = chainSelectors.selectAll(state.chains).filter((data) => !!data.selected);
			return {
				notes: notes.length > 0 ? notes : undefined,
				bombs: bombs.length > 0 ? bombs : undefined,
				obstacles: obstacles.length > 0 ? obstacles : undefined,
				arcs: arcs.length > 0 ? arcs : undefined,
				chains: chains.length > 0 ? chains : undefined,
			};
		}),
		selectAnySelectedObjects: createSelector(selectPresent, (state) => {
			const notes = noteSelectors.selectAll(state.notes).filter((data) => !!data.selected);
			const bombs = bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected);
			const obstacles = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
			const arcs = arcSelectors.selectAll(state.arcs).filter((data) => !!data.selected);
			const chains = chainSelectors.selectAll(state.chains).filter((data) => !!data.selected);
			return notes.length + bombs.length + obstacles.length + arcs.length + chains.length > 0;
		}),
		selectAllSelectedObjects: createSelector(selectPresent, (state) => {
			const notes = noteSelectors.selectAll(state.notes).filter((data) => !!data.selected);
			const bombs = bombSelectors.selectAll(state.bombs).filter((data) => !!data.selected);
			const obstacles = obstacleSelectors.selectAll(state.obstacles).filter((data) => !!data.selected);
			const arcs = arcSelectors.selectAll(state.arcs).filter((data) => !!data.selected);
			const chains = chainSelectors.selectAll(state.chains).filter((data) => !!data.selected);
			return [...notes, ...bombs, ...obstacles, ...arcs, ...chains];
		}),
	},
	reducers: (api) => {
		return {
			undo: api.reducer<{ shouldJump?: boolean }>(history.undo),
			redo: api.reducer<{ shouldJump?: boolean }>(history.redo),
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
			addArc: api.reducer<IWrapArc>(
				history.undoable((state, action) => {
					arcs.upsertOne(state.arcs, action.payload);
				}),
			),
			updateArc: api.reducer<Update<IWrapArc, EntityId>>(
				history.undoable((state, action) => {
					arcs.updateOne(state.arcs, action.payload);
				}),
			),
			removeArc: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					arcs.removeOne(state.arcs, action.payload.id);
				}),
			),
			selectArc: api.reducer<{ id: EntityId }>((state, action) => {
				arcs.updateOne(state.present.arcs, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectArc: api.reducer<{ id: EntityId }>((state, action) => {
				arcs.updateOne(state.present.arcs, { id: action.payload.id, changes: { selected: false } });
			}),
			addChain: api.reducer<IWrapChain>(
				history.undoable((state, action) => {
					chains.upsertOne(state.chains, action.payload);
				}),
			),
			updateChain: api.reducer<Update<IWrapChain, EntityId>>(
				history.undoable((state, action) => {
					chains.updateOne(state.chains, action.payload);
				}),
			),
			removeChain: api.reducer<{ id: EntityId }>(
				history.undoable((state, action) => {
					chains.removeOne(state.chains, action.payload.id);
				}),
			),
			selectChain: api.reducer<{ id: EntityId }>((state, action) => {
				chains.updateOne(state.present.chains, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectChain: api.reducer<{ id: EntityId }>((state, action) => {
				chains.updateOne(state.present.chains, { id: action.payload.id, changes: { selected: false } });
			}),
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
					if (action.payload.arcs) {
						arcs.upsertMany(state.arcs, action.payload.arcs);
					}
					if (action.payload.chains) {
						chains.upsertMany(state.chains, action.payload.chains);
					}
				}),
			),
			updateAllSelectedObjects: api.reducer<{ noteChanges: Partial<IWrapColorNote>; bombChanges: Partial<IWrapBombNote>; obstacleChanges: Partial<IWrapObstacle>; arcChanges: Partial<IWrapArc>; chainChanges: Partial<IWrapChain> }>(
				history.undoable((state, action) => {
					noteReducers.updateAllSelected(state.notes, () => action.payload.noteChanges);
					bombReducers.updateAllSelected(state.bombs, () => action.payload.bombChanges);
					obstacleReducers.updateAllSelected(state.obstacles, () => action.payload.obstacleChanges);
					arcReducers.updateAllSelected(state.arcs, () => action.payload.arcChanges);
					chainReducers.updateAllSelected(state.chains, () => action.payload.chainChanges);
				}),
			),
			mirrorAllSelectedObjects: api.reducer<{ axis: "horizontal" | "vertical"; noteGrid?: IGrid; obstacleGrid?: IGrid }>(
				history.undoable((state, action) => {
					const { axis, noteGrid, obstacleGrid } = action.payload;
					noteReducers.replaceAllSelected(state.notes, mirrorGridObjectProperties(axis, noteGrid, 0));
					noteReducers.replaceAllSelected(state.notes, mirrorBaseNoteProperties(axis));
					bombReducers.replaceAllSelected(state.bombs, mirrorGridObjectProperties(axis, noteGrid, 0));
					arcReducers.replaceAllSelected(state.arcs, (data) => {
						const { posX, posY } = mirrorGridObjectProperties(axis, noteGrid, 0)(data);
						const { color, direction } = mirrorBaseNoteProperties(axis)(data);
						const { posX: tailPosX, posY: tailPosY } = mirrorGridObjectProperties(axis, noteGrid, 0)({ posX: data.tailPosX, posY: data.tailPosY });
						const { direction: tailDirection } = mirrorBaseNoteProperties(axis)({ color: data.color, direction: data.tailDirection });
						const midAnchor = data.midAnchor !== 0 ? cycle([SliderMidAnchorMode.CLOCKWISE, SliderMidAnchorMode.COUNTER_CLOCKWISE], data.midAnchor, 1) : data.midAnchor;
						return { ...data, posX, posY, color, direction, tailPosX, tailPosY, tailDirection, midAnchor };
					});
					chainReducers.replaceAllSelected(state.chains, (data) => {
						const { posX, posY } = mirrorGridObjectProperties(axis, noteGrid, 0)(data);
						const { color, direction } = mirrorBaseNoteProperties(axis)(data);
						const { posX: tailPosX, posY: tailPosY } = mirrorGridObjectProperties(axis, noteGrid, 0)({ posX: data.tailPosX, posY: data.tailPosY });
						return { ...data, posX, posY, color, direction, tailPosX, tailPosY };
					});
					if (axis === "horizontal") {
						obstacleReducers.replaceAllSelected(state.obstacles, mirrorGridObjectProperties(axis, obstacleGrid, 0));
					}
				}),
			),
			nudgeAllSelectedObjects: api.reducer<{ direction: "forwards" | "backwards"; amount: number }>(
				history.undoable((state, action) => {
					const { direction, amount } = action.payload;
					noteReducers.updateAllSelected(state.notes, nudgeItem(direction, amount));
					bombReducers.updateAllSelected(state.bombs, nudgeItem(direction, amount));
					obstacleReducers.updateAllSelected(state.obstacles, nudgeItem(direction, amount));
					arcReducers.updateAllSelected(state.arcs, (data) => {
						const { time } = nudgeItem(direction, amount)(data);
						const { time: tailTime } = nudgeItem(direction, amount)({ time: data.tailTime });
						return { ...data, time, tailTime };
					});
					chainReducers.updateAllSelected(state.chains, (data) => {
						const { time } = nudgeItem(direction, amount)(data);
						const { time: tailTime } = nudgeItem(direction, amount)({ time: data.tailTime });
						return { ...data, time, tailTime };
					});
				}),
			),
			removeAllSelectedObjects: api.reducer(
				history.undoable((state) => {
					noteReducers.removeAllSelected(state.notes);
					bombReducers.removeAllSelected(state.bombs);
					obstacleReducers.removeAllSelected(state.obstacles);
					arcReducers.removeAllSelected(state.arcs);
					chainReducers.removeAllSelected(state.chains);
				}),
			),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapContents.fulfilled, (state, action) => {
			notes.setAll(state.present.notes, action.payload.entities.notes ?? []);
			bombs.setAll(state.present.bombs, action.payload.entities.bombs ?? []);
			obstacles.setAll(state.present.obstacles, action.payload.entities.obstacles ?? []);
			arcs.setAll(state.present.arcs, action.payload.entities.arcs ?? []);
			chains.setAll(state.present.chains, action.payload.entities.chains ?? []);
		});
		builder.addCase(leaveEditor, () => {
			return history.getInitialState({
				notes: notes.getInitialState(),
				bombs: bombs.getInitialState(),
				obstacles: obstacles.getInitialState(),
				arcs: arcs.getInitialState(),
				chains: chains.getInitialState(),
			});
		});
		builder.addCase(selectAllEntities, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			noteReducers.updateAll(state.present.notes, () => ({ selected: true }));
			bombReducers.updateAll(state.present.bombs, () => ({ selected: true }));
			obstacleReducers.updateAll(state.present.obstacles, () => ({ selected: true }));
			arcReducers.updateAll(state.present.arcs, () => ({ selected: true }));
			chainReducers.updateAll(state.present.chains, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;
			noteReducers.updateAll(state.present.notes, () => ({ selected: false }));
			bombReducers.updateAll(state.present.bombs, () => ({ selected: false }));
			obstacleReducers.updateAll(state.present.obstacles, () => ({ selected: false }));
			arcReducers.updateAll(state.present.arcs, () => ({ selected: false }));
			chainReducers.updateAll(state.present.chains, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			if (action.payload.view !== View.BEATMAP) return state;

			function isWithinRange<T extends IWrapBaseObject>(x: T) {
				let endTime = x.time;
				if (isArc(x) || isChain(x)) {
					endTime = x.tailTime;
				} else if (isObstacle(x)) {
					endTime = x.time + x.duration;
				}
				return x.time < action.payload.endBeat && endTime >= action.payload.startBeat - 0.01;
			}

			noteReducers.updateAll(state.present.notes, (x) => ({ selected: isWithinRange(x) }));
			bombReducers.updateAll(state.present.bombs, (x) => ({ selected: isWithinRange(x) }));
			obstacleReducers.updateAll(state.present.obstacles, (x) => ({ selected: isWithinRange(x) }));
			arcReducers.updateAll(state.present.arcs, (x) => ({ selected: isWithinRange(x) }));
			chainReducers.updateAll(state.present.chains, (x) => ({ selected: isWithinRange(x) }));
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
				case ObjectType.ARC: {
					arcReducers.updateAll(state.present.arcs, () => ({ selected: false }));
					break;
				}
				case ObjectType.CHAIN: {
					chainReducers.updateAll(state.present.chains, () => ({ selected: false }));
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
	selectAllArcs,
	selectPastArcs,
	selectTotalArcs,
	selectFutureArcs,
	selectAllSelectedArcs,
	selectAllChains,
	selectPastChains,
	selectTotalChains,
	selectFutureChains,
	selectAllSelectedChains,
	selectSelectedObjects,
	selectAnySelectedObjects,
	selectAllSelectedObjects,
} = slice.getSelectors(slice.selectSlice);

export const { undo: undoObjects, redo: redoObjects, clearHistory: clearObjectHistory, upsertObjects, mirrorAllSelectedObjects, nudgeAllSelectedObjects, removeAllSelectedObjects } = slice.actions;
export const { addColorNote, updateColorNote, selectColorNote, deselectColorNote, removeColorNote } = slice.actions;
export const { addBombNote, selectBombNote, deselectBombNote, removeBombNote } = slice.actions;
export const { addObstacle, updateObstacle, selectObstacle, deselectObstacle, updateAllSelectedObjects, removeObstacle } = slice.actions;
export const { addArc, updateArc, selectArc, deselectArc, removeArc } = slice.actions;
export const { addChain, updateChain, selectChain, deselectChain, removeChain } = slice.actions;

export const deselectAllObjectsOfType = createAction("deselectAllObjectsOfType", (args: { itemType: ObjectType }) => {
	return { payload: { ...args } };
});

export default slice;
