import { createEntityAdapter, createSlice, type EntityId, isAnyOf } from "@reduxjs/toolkit";
import { createColorBoostEvent, sortObjectFn } from "bsmap";
import type { wrapper } from "bsmap/types";

import { isBoostEvent, resolveEventId, resolveTrackIdForEvent } from "$/helpers/events.helpers";
import { nudgeItem } from "$/helpers/item.helpers";
import { addSong, bulkRemoveEvent, cutSelection, deselectAllEntities, deselectEvent, drawEventSelectionBox, leaveEditor, loadBeatmapEntities, nudgeSelection, pasteSelection, removeAllSelectedEvents, removeEvent, selectAllEntities, selectAllEntitiesInRange, selectEvent, startLoadingMap } from "$/store/actions";
import { createEditorObjectReducers, createEditorObjectSelectors, createEventReducerFactory, createEventSelectors } from "$/store/helpers";
import { type App, View } from "$/types";

const adapter = createEntityAdapter<App.IWrapEditorObject<wrapper.IWrapColorBoostEvent>, EntityId>({
	selectId: resolveEventId,
	sortComparer: sortObjectFn,
});

const { selectAll } = adapter.getSelectors();
const { selectAllSelected } = createEditorObjectSelectors(adapter);
const { createEventSelector } = createEventSelectors(adapter);
const { removeAllSelected, updateAll, updateAllSelected } = createEditorObjectReducers(adapter);

const createEventReducer = createEventReducerFactory(adapter);

const slice = createSlice({
	name: "basicEvents",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectToggleAtBeat: createEventSelector((data) => data.toggle, false),
	},
	reducers: () => {
		return {
			addOne: createEventReducer<{ data: wrapper.IWrapColorBoostEvent; overwrite?: boolean }>(({ match }, state, action) => {
				const { data, overwrite } = action.payload;
				if (!overwrite && match) return state;
				if (!isBoostEvent(data)) return state;
				return adapter.upsertOne(state, createColorBoostEvent({ ...data }));
			}),
			updateOne: createEventReducer<{ changes: Partial<wrapper.IWrapColorBoostEvent> }>(({ match }, state, action) => {
				if (!match) return state;
				return adapter.updateOne(state, { id: adapter.selectId({ ...match }), changes: action.payload.changes });
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { boostEvents } = action.payload;
			return adapter.setAll(state, boostEvents ?? []);
		});
		builder.addCase(removeAllSelectedEvents, (state) => {
			return removeAllSelected(state);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return removeAllSelected(state);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			if (!data.boostEvents) return state;
			updateAll(state, () => ({ selected: false }));
			return adapter.upsertMany(
				state,
				data.boostEvents.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
			);
		});
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			const { view, metadata } = action.payload;
			if (view !== View.LIGHTSHOW || !metadata) return state;
			return updateAll(state, () => ({ selected: true }));
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return updateAll(state, () => ({ selected: false }));
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return updateAll(state, (x) => ({ selected: x.time >= start - 0.01 && x.time < end }));
		});
		builder.addCase(drawEventSelectionBox.fulfilled, (state, action) => {
			const { tracks, selectionBoxInBeats, metadata } = action.payload;
			const allEntities = selectAll(state);
			const allTracks = Object.keys(tracks);
			if (!selectionBoxInBeats.withPrevious) {
				const allSelected = allEntities.filter((x) => x.selected);
				adapter.updateMany(
					state,
					allSelected.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
				);
			}
			const allVisible = allEntities.filter((x) => {
				const isInWindow = x.time >= metadata.window.startBeat && x.time <= metadata.window.endBeat;
				const isInVisibleTracks = x.time >= selectionBoxInBeats.startBeat && x.time <= selectionBoxInBeats.endBeat;
				return isInWindow && isInVisibleTracks;
			});
			for (const event of allVisible) {
				const eventTrackIndex = allTracks.findIndex((id) => Number.parseInt(id, 10) === resolveTrackIdForEvent(event));
				const isInSelectionBox = eventTrackIndex >= selectionBoxInBeats.startTrackIndex && eventTrackIndex <= selectionBoxInBeats.endTrackIndex;
				adapter.updateOne(state, { id: adapter.selectId(event), changes: { selected: isInSelectionBox || (selectionBoxInBeats.withPrevious && event.selected) } });
			}
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return updateAllSelected(state, (x) => nudgeItem(x, direction, amount));
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap, leaveEditor), () => adapter.getInitialState());
		builder.addMatcher(
			isAnyOf(removeEvent, bulkRemoveEvent),
			createEventReducer(({ match }, state) => {
				if (!match) return state;
				return adapter.removeOne(state, adapter.selectId({ ...match }));
			}),
		);
		builder.addMatcher(
			isAnyOf(selectEvent, deselectEvent),
			createEventReducer(({ match }, state, action) => {
				if (!match) return state;
				return adapter.updateOne(state, { id: adapter.selectId({ ...match }), changes: { selected: selectEvent.match(action) } });
			}),
		);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
