import { createEntityAdapter, createSlice, type EntityId, isAnyOf } from "@reduxjs/toolkit";
import { createBasicEvent, type IWrapBasicEvent, sortObjectFn } from "bsmap";

import { deserializeBasicEventValue, isBasicLightEvent, resolveEventId, resolveTrackIdForEvent, serializeBasicEventValue } from "$/helpers/events.helpers";
import { nudgeItem } from "$/helpers/item.helpers";
import { addSong, bulkRemoveEvent, cutSelection, deselectAllEntities, deselectEvent, drawEventSelectionBox, leaveEditor, loadBeatmapEntities, nudgeSelection, pasteSelection, removeAllSelectedEvents, removeEvent, selectAllEntities, selectAllEntitiesInRange, selectEvent, startLoadingMap } from "$/store/actions";
import { createEditorObjectReducers, createEditorObjectSelectors, createEventReducerFactory, createEventSelectors } from "$/store/helpers";
import { App, View } from "$/types";
import { cycle } from "$/utils";

const adapter = createEntityAdapter<App.IWrapEditorObject<IWrapBasicEvent>, EntityId>({
	selectId: resolveEventId,
	sortComparer: sortObjectFn,
});

const { selectAll } = adapter.getSelectors();
const { selectAllSelected } = createEditorObjectSelectors(adapter);
const { selectAllForTrack, createEventSelector } = createEventSelectors(adapter);
const { removeAllSelected, updateAll, updateAllSelected } = createEditorObjectReducers(adapter);

const createEventReducer = createEventReducerFactory(adapter);

const slice = createSlice({
	name: "basicEvents",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectAllForTrack: selectAllForTrack,
		selectValueForTrackAtBeat: createEventSelector((data) => data.value, 0),
	},
	reducers: () => {
		const MIRRORABLE_COLORS = Object.values(App.EventColor).slice(0, -1);

		return {
			addOne: createEventReducer<{ data: IWrapBasicEvent; overwrite?: boolean }>(({ match, trackId }, state, action) => {
				const { data, overwrite } = action.payload;
				if (!overwrite && match) return state;
				return adapter.upsertOne(state, createBasicEvent({ ...data, type: trackId }));
			}),
			updateOne: createEventReducer<{ changes: Partial<IWrapBasicEvent> }>(({ match, trackId }, state, action) => {
				if (!match) return state;
				return adapter.updateOne(state, { id: adapter.selectId({ ...match, type: trackId }), changes: action.payload.changes });
			}),
			updateColor: createEventReducer(({ match, trackId }, state, action) => {
				const { tracks } = action.payload;
				if (!match || !isBasicLightEvent(match, tracks)) return state;
				const { effect, color } = deserializeBasicEventValue(match.value, { tracks, trackId });
				const newColor = color && MIRRORABLE_COLORS.includes(color) ? cycle(MIRRORABLE_COLORS, color) : color;
				const newValue = serializeBasicEventValue({ effect, color: newColor }, { tracks });
				return adapter.updateOne(state, { id: adapter.selectId({ ...match, type: trackId }), changes: { value: newValue } });
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { basicEvents } = action.payload;
			return adapter.setAll(state, basicEvents ?? []);
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
			if (!data.basicEvents) return state;
			updateAll(state, () => ({ selected: false }));
			return adapter.upsertMany(
				state,
				data.basicEvents.map((x) => ({ ...x, selected: true, time: x.time + deltaBetweenPeriods })),
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
			const { startBeat, endBeat, view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			return updateAll(state, (x) => ({ selected: x.time >= startBeat - 0.01 && x.time < endBeat }));
		});
		builder.addCase(drawEventSelectionBox.fulfilled, (state, action) => {
			const { tracks, selectionBoxInBeats, metadata } = action.payload;
			const allEntities = selectAll(state);
			const allTracks = Object.keys(tracks).concat("5");
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
			createEventReducer(({ match, trackId }, state) => {
				if (!match) return state;
				return adapter.removeOne(state, adapter.selectId({ ...match, type: trackId }));
			}),
		);
		builder.addMatcher(
			isAnyOf(selectEvent, deselectEvent),
			createEventReducer(({ match, trackId }, state, action) => {
				if (!match) return state;
				return adapter.updateOne(state, { id: adapter.selectId({ ...match, type: trackId }), changes: { selected: selectEvent.match(action) } });
			}),
		);
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
