import { createDraftSafeSelector, createEntityAdapter, createSlice, type EntityId, isAnyOf } from "@reduxjs/toolkit";
import { type EnvironmentName, type IWrapBasicEvent, type IWrapColorBoostEvent, sortObjectFn } from "bsmap";
import { createHistoryAdapter, type HistoryState } from "history-adapter/redux";

import { isBasicEvent, isBoostEvent, isTrackGroupable, resolveEventId, resolveGroupTrackIds, resolveTrackIdForEvent } from "$/helpers/events.helpers";
import { nudgeItem } from "$/helpers/item.helpers";
import { cutSelection, deselectAllEntities, drawEventSelectionBox, leaveEditor, loadBeatmapEntities, nudgeSelection, pasteSelection, selectAllEntities, selectAllEntitiesInRange, startLoadingMap } from "$/store/actions";
import { createEditorObjectAdapter } from "$/store/helpers/editor.helpers";
import { selectNextSnapshot, selectPrevSnapshot } from "$/store/helpers/selectors";
import { type App, View } from "$/types";

const basicEvents = createEntityAdapter<App.IWrapEditorObject<IWrapBasicEvent>, EntityId>({ selectId: resolveEventId, sortComparer: sortObjectFn });
const boostEvents = createEntityAdapter<App.IWrapEditorObject<IWrapColorBoostEvent>, EntityId>({ selectId: resolveEventId, sortComparer: sortObjectFn });

const basicSelectors = basicEvents.getSelectors();
const boostSelectors = boostEvents.getSelectors();

const { updateAll: updateAllBasicEvents, updateAllSelected: updateAllSelectedBasicEvents, removeAllSelected: removeAllSelectedBasicEvents } = createEditorObjectAdapter(basicEvents);
const { updateAll: updateAllBoostEvents, updateAllSelected: updateAllSelectedBoostEvents, removeAllSelected: removeAllSelectedBoostEvents } = createEditorObjectAdapter(boostEvents);

interface State {
	basicEvents: ReturnType<typeof basicEvents.getInitialState>;
	boostEvents: ReturnType<typeof boostEvents.getInitialState>;
}

const history = createHistoryAdapter<State>({ limit: 100 });

const { selectPresent, selectCanRedo, selectCanUndo } = history.getSelectors();

const slice = createSlice({
	name: "events",
	initialState: history.getInitialState({
		basicEvents: basicEvents.getInitialState(),
		boostEvents: boostEvents.getInitialState(),
	}),
	selectors: {
		selectCanRedo,
		selectCanUndo,
		selectAllBasicEvents: createDraftSafeSelector(selectPresent, (state) => basicSelectors.selectAll(state.basicEvents)),
		selectAllBasicEventsForTrack: createDraftSafeSelector([selectPresent, (_, trackId: number) => trackId], (state, trackId) => {
			return basicSelectors.selectAll(state.basicEvents).filter((x) => resolveTrackIdForEvent(x) === trackId);
		}),
		selectAllSelectedBasicEvents: createDraftSafeSelector(selectPresent, (state) => basicSelectors.selectAll(state.basicEvents).filter((data) => !!data.selected)),
		selectTotalBasicEvents: (state) => basicSelectors.selectTotal(state.present.basicEvents),
		selectPastBasicEvents: createDraftSafeSelector(selectPrevSnapshot, (state) => basicSelectors.selectAll(state.basicEvents)),
		selectFutureBasicEvents: createDraftSafeSelector(selectNextSnapshot, (state) => basicSelectors.selectAll(state.basicEvents)),
		selectAllBoostEvents: createDraftSafeSelector(selectPresent, (state) => boostSelectors.selectAll(state.boostEvents)),
		selectAllSelectedBoostEvents: createDraftSafeSelector(selectPresent, (state) => boostSelectors.selectAll(state.boostEvents).filter((data) => !!data.selected)),
		selectTotalBoostEvents: (state) => boostSelectors.selectTotal(state.present.boostEvents),
		selectPastBoostEvents: createDraftSafeSelector(selectPrevSnapshot, (state) => boostSelectors.selectAll(state.boostEvents)),
		selectFutureBoostEvents: createDraftSafeSelector(selectNextSnapshot, (state) => boostSelectors.selectAll(state.boostEvents)),
		selectValueForTrackAtBeat: createDraftSafeSelector([selectPresent, (_: HistoryState<State>, options: { trackId: number; beforeBeat: number }) => options], (state, options) => {
			const events = basicSelectors.selectAll(state.basicEvents).filter((x) => {
				return x.time < options.beforeBeat && resolveTrackIdForEvent(x) === options.trackId;
			});
			return events[events.length - 1]?.value ?? 0;
		}),
		selectColorBoostAtBeat: createDraftSafeSelector([selectPresent, (_: HistoryState<State>, options: { beforeBeat: number }) => options], (state, options) => {
			const events = boostSelectors.selectAll(state.boostEvents).filter((x) => {
				return x.time < options.beforeBeat;
			});
			return events[events.length - 1]?.toggle ?? false;
		}),
		selectSelectedEvents: createDraftSafeSelector(selectPresent, (state) => {
			const basicEvents = basicSelectors.selectAll(state.basicEvents).filter((data) => !!data.selected);
			const boostEvents = boostSelectors.selectAll(state.boostEvents).filter((data) => !!data.selected);
			return {
				basicEvents: basicEvents.length > 0 ? basicEvents : undefined,
				boostEvents: boostEvents.length > 0 ? boostEvents : undefined,
			};
		}),
		selectAnySelectedEvents: createDraftSafeSelector(selectPresent, (state) => {
			const basicEvents = basicSelectors.selectAll(state.basicEvents).filter((data) => !!data.selected);
			const boostEvents = boostSelectors.selectAll(state.boostEvents).filter((data) => !!data.selected);
			return basicEvents.length + boostEvents.length > 0;
		}),
	},
	reducers: (api) => {
		return {
			undo: history.undo,
			redo: history.redo,
			clearHistory: history.clearHistory,
			addBasicEvent: api.reducer<{ data: IWrapBasicEvent; overwrite?: boolean; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					const trackId = resolveTrackIdForEvent(action.payload.data);
					basicEvents.upsertOne(state.basicEvents, action.payload.data);
					if (action.payload.areLasersLocked && isTrackGroupable(trackId, action.payload.environment)) {
						const groupTrackIds = resolveGroupTrackIds(trackId, action.payload.environment);
						for (const mirrorTrackId of groupTrackIds) {
							basicEvents.upsertOne(state.basicEvents, { ...action.payload.data, type: mirrorTrackId });
						}
					}
				}),
			),
			updateBasicEvent: api.reducer<{ id: EntityId; changes: Partial<IWrapBasicEvent>; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					const data = basicSelectors.selectById(state.basicEvents, action.payload.id);
					const trackId = resolveTrackIdForEvent(data);
					basicEvents.updateOne(state.basicEvents, { id: action.payload.id, changes: action.payload.changes });
					if (action.payload.areLasersLocked && isTrackGroupable(trackId, action.payload.environment)) {
						const groupTrackIds = resolveGroupTrackIds(trackId, action.payload.environment);
						for (const mirrorTrackId of groupTrackIds) {
							const mirrorEventId = basicEvents.selectId({ ...data, type: mirrorTrackId });
							basicEvents.updateOne(state.basicEvents, { id: mirrorEventId, changes: action.payload.changes });
						}
					}
				}),
			),
			removeBasicEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					const data = basicSelectors.selectById(state.basicEvents, action.payload.id);
					const trackId = resolveTrackIdForEvent(data);
					basicEvents.removeOne(state.basicEvents, action.payload.id);
					if (action.payload.areLasersLocked && isTrackGroupable(trackId, action.payload.environment)) {
						const groupTrackIds = resolveGroupTrackIds(trackId, action.payload.environment);
						for (const mirrorTrackId of groupTrackIds) {
							const mirrorEventId = basicEvents.selectId({ ...data, type: mirrorTrackId });
							basicEvents.removeOne(state.basicEvents, mirrorEventId);
						}
					}
				}),
			),
			selectBasicEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>((state, action) => {
				basicEvents.updateOne(state.present.basicEvents, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectBasicEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>((state, action) => {
				boostEvents.updateOne(state.present.boostEvents, { id: action.payload.id, changes: { selected: false } });
			}),
			addBoostEvent: api.reducer<{ data: IWrapColorBoostEvent; overwrite?: boolean; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					boostEvents.upsertOne(state.boostEvents, action.payload.data);
				}),
			),
			updateBoostEvent: api.reducer<{ id: EntityId; changes: Partial<IWrapColorBoostEvent>; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					boostEvents.updateOne(state.boostEvents, action.payload);
				}),
			),
			removeBoostEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>(
				history.undoable((state, action) => {
					boostEvents.removeOne(state.boostEvents, action.payload.id);
				}),
			),
			selectBoostEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>((state, action) => {
				boostEvents.updateOne(state.present.boostEvents, { id: action.payload.id, changes: { selected: true } });
			}),
			deselectBoostEvent: api.reducer<{ id: EntityId; environment: EnvironmentName; areLasersLocked?: boolean }>((state, action) => {
				boostEvents.updateOne(state.present.boostEvents, { id: action.payload.id, changes: { selected: false } });
			}),
			removeAllSelectedEvents: api.reducer(
				history.undoable((state) => {
					removeAllSelectedBasicEvents(state.basicEvents);
					removeAllSelectedBoostEvents(state.boostEvents);
				}),
			),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			basicEvents.setAll(state.present.basicEvents, action.payload.basicEvents ?? []);
			boostEvents.setAll(state.present.boostEvents, action.payload.boostEvents ?? []);
		});
		builder.addCase(
			nudgeSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.LIGHTSHOW) return state;
				const { direction, amount } = action.payload;
				updateAllSelectedBasicEvents(state.basicEvents, nudgeItem(direction, amount));
				updateAllSelectedBoostEvents(state.boostEvents, nudgeItem(direction, amount));
			}),
		);
		builder.addCase(
			cutSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.LIGHTSHOW) return state;
				removeAllSelectedBasicEvents(state.basicEvents);
				removeAllSelectedBoostEvents(state.boostEvents);
			}),
		);
		builder.addCase(
			pasteSelection.fulfilled,
			history.undoable((state, action) => {
				if (action.payload.view !== View.LIGHTSHOW) return state;
				if (action.payload.data.basicEvents) {
					basicEvents.upsertMany(
						state.basicEvents,
						action.payload.data.basicEvents.map((x) => ({ ...x, selected: true, time: x.time + action.payload.deltaBetweenPeriods })),
					);
				}
				if (action.payload.data.boostEvents) {
					boostEvents.upsertMany(
						state.boostEvents,
						action.payload.data.boostEvents.map((x) => ({ ...x, selected: true, time: x.time + action.payload.deltaBetweenPeriods })),
					);
				}
			}),
		);
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			if (action.payload.view !== View.LIGHTSHOW) return state;
			updateAllBasicEvents(state.present.basicEvents, () => ({ selected: true }));
			updateAllBoostEvents(state.present.boostEvents, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			if (action.payload.view !== View.LIGHTSHOW) return state;
			updateAllBasicEvents(state.present.basicEvents, () => ({ selected: false }));
			updateAllBoostEvents(state.present.boostEvents, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			if (action.payload.view !== View.LIGHTSHOW) return state;
			updateAllBasicEvents(state.present.basicEvents, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
			updateAllBoostEvents(state.present.boostEvents, (x) => ({ selected: x.time >= action.payload.startBeat - 0.01 && x.time < action.payload.endBeat }));
		});
		builder.addCase(drawEventSelectionBox.fulfilled, (state, action) => {
			const { tracks, selectionBoxInBeats, metadata } = action.payload;

			const allTracks = Object.keys(tracks).concat("5");
			const allBasicEvents = basicSelectors.selectAll(state.present.basicEvents);
			const allBoostEvents = boostSelectors.selectAll(state.present.boostEvents);

			if (!selectionBoxInBeats.withPrevious) {
				basicEvents.updateMany(
					state.present.basicEvents,
					allBasicEvents.filter((x) => x.selected).map((x) => ({ id: basicEvents.selectId(x), changes: { selected: false } })),
				);
				boostEvents.updateMany(
					state.present.boostEvents,
					allBoostEvents.filter((x) => x.selected).map((x) => ({ id: boostEvents.selectId(x), changes: { selected: false } })),
				);
			}

			const allVisibleEvents = [...allBasicEvents, ...allBoostEvents].filter((x) => {
				const isInWindow = x.time >= metadata.window.startBeat && x.time <= metadata.window.endBeat;
				const isInVisibleTracks = x.time >= selectionBoxInBeats.startBeat && x.time <= selectionBoxInBeats.endBeat;
				return isInWindow && isInVisibleTracks;
			});

			for (const event of allVisibleEvents) {
				const eventTrackIndex = allTracks.findIndex((id) => Number.parseInt(id, 10) === resolveTrackIdForEvent(event));
				const isInSelectionBox = eventTrackIndex >= selectionBoxInBeats.startTrackIndex && eventTrackIndex <= selectionBoxInBeats.endTrackIndex;

				if (isBasicEvent<App.IWrapEditorObject<IWrapBasicEvent>>(event)) {
					basicEvents.updateOne(state.present.basicEvents, { id: basicEvents.selectId(event), changes: { selected: isInSelectionBox || (selectionBoxInBeats.withPrevious && event.selected) } });
				}
				if (isBoostEvent<App.IWrapEditorObject<IWrapColorBoostEvent>>(event)) {
					boostEvents.updateOne(state.present.boostEvents, { id: boostEvents.selectId(event), changes: { selected: isInSelectionBox || (selectionBoxInBeats.withPrevious && event.selected) } });
				}
			}
		});
		builder.addMatcher(isAnyOf(startLoadingMap, leaveEditor), () => {
			history.getInitialState({
				basicEvents: basicEvents.getInitialState(),
				boostEvents: boostEvents.getInitialState(),
			});
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
