import { type EntityId, type PayloadAction, createDraftSafeSelector, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { type EventType, createBasicEvent, sortObjectFn } from "bsmap";

import { isLightEvent, isMirroredTrack, resolveEventDerivedProps, resolveEventId, resolveEventValue, resolveMirroredTrack } from "$/helpers/events.helpers";
import { nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
import { addSong, bulkRemoveEvent, cutSelection, deselectAllEntities, deselectEvent, drawEventSelectionBox, loadBeatmapEntities, nudgeSelection, pasteSelection, removeAllSelectedEvents, removeEvent, selectAllEntities, selectAllEntitiesInRange, selectEvent, startLoadingMap } from "$/store/actions";
import { createEventSelector, createSelectedEntitiesSelector } from "$/store/helpers";
import { type Accept, App, type IEventTracks, View } from "$/types";
import { cycle } from "$/utils";

const adapter = createEntityAdapter<App.IBasicEvent, EntityId>({
	selectId: resolveEventId,
	sortComparer: sortObjectFn,
});

const { selectAll, selectById } = adapter.getSelectors();
const selectEventByPosition = createEventSelector(selectAll);
const selectAllSelected = createSelectedEntitiesSelector(selectAll);
const selectAllForTrack = createDraftSafeSelector([selectAll, (_, trackId: Accept<EventType, number>) => trackId], (state, trackId) => {
	return state.filter((x) => x.type === trackId);
});
const selectAllForTrackBeforeBeat = createDraftSafeSelector([selectAll, (_, query: { trackId: Accept<EventType, number>; beforeBeat: number }) => query], (state, { trackId, beforeBeat }) => {
	return state.filter((x) => x.type === trackId && x.time < beforeBeat);
});

const MIRRORABLE_COLORS = Object.values(App.EventColor).slice(0, -1);

const slice = createSlice({
	name: "basicEvents",
	initialState: adapter.getInitialState(),
	selectors: {
		selectAll: selectAll,
		selectAllSelected: selectAllSelected,
		selectAllForTrack: selectAllForTrack,
		selectForTrackAtBeat: createDraftSafeSelector(selectAllForTrackBeforeBeat, (state) => {
			if (state.length === 0) return null;
			return state[state.length - 1];
		}),
		selectValueForTrackAtBeat: createDraftSafeSelector(selectAllForTrackBeforeBeat, (state) => {
			const { value } = state[0];
			if (!state.length) return 0;
			return value;
		}),
	},
	reducers: {
		addOne: (state, action: PayloadAction<{ tracks?: IEventTracks; areLasersLocked?: boolean; data: App.IBasicEvent; overwrite?: boolean }>) => {
			const { tracks, areLasersLocked, data, overwrite } = action.payload;
			const match = selectEventByPosition(state, data);
			if (!overwrite && match) return state;
			const newEvent = createBasicEvent({ ...data }) as App.IBasicEvent;
			adapter.upsertOne(state, newEvent);
			if (areLasersLocked && isMirroredTrack(newEvent.type, tracks)) {
				// Important: if the side lasers are "locked" we need to mimic this event from the left laser to the right laser.
				const mirrorTrackId = resolveMirroredTrack(newEvent.type, tracks);
				const symmetricalEvent = createBasicEvent({ ...newEvent, type: mirrorTrackId });
				adapter.upsertOne(state, symmetricalEvent);
			}
		},
		updateOne: (state, action: PayloadAction<{ query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTracks; areLasersLocked?: boolean; changes: Partial<App.IBasicEvent> }>) => {
			const { query, tracks, areLasersLocked, changes } = action.payload;
			const match = selectById(state, resolveEventId(query));
			if (!match) return state;
			adapter.updateOne(state, { id: adapter.selectId(match), changes });
			if (areLasersLocked && isMirroredTrack(match.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(match.type, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: query.time, type: mirrorTrackId }), changes });
			}
		},
		updateColor: (state, action: PayloadAction<{ query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTracks; areLasersLocked?: boolean }>) => {
			const { query, tracks, areLasersLocked } = action.payload;
			const match = selectById(state, resolveEventId(query));
			if (!match) return state;
			if (!isLightEvent(match, tracks)) return state;
			const { effect, color } = resolveEventDerivedProps(match.value, { tracks, trackId: query.type });
			const newColor = color && MIRRORABLE_COLORS.includes(color) ? cycle(MIRRORABLE_COLORS, color) : color;
			const newValue = resolveEventValue({ effect, color: newColor }, { tracks });
			adapter.updateOne(state, { id: adapter.selectId(match), changes: { value: newValue } });
			if (areLasersLocked && isMirroredTrack(match.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(match.type, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: query.time, type: mirrorTrackId }), changes: { value: newValue } });
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { events } = action.payload;
			return adapter.setAll(state, events ?? []);
		});
		builder.addCase(removeAllSelectedEvents, (state) => {
			const entities = selectAllSelected(state);
			return adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAllSelected(state);
			return adapter.removeMany(
				state,
				entities.map((x) => adapter.selectId(x)),
			);
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			if (!data.events) return state;
			const entities = selectAll(state);
			adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
			const timeShiftedEntities = data.events.map((x) => ({ ...x, selected: true, time: resolveTimeForItem(x) + deltaBetweenPeriods }) as App.IBasicEvent);
			return adapter.upsertMany(state, timeShiftedEntities);
		});
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			const { view, metadata } = action.payload;
			if (view !== View.LIGHTSHOW || !metadata) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= metadata.startBeat && x.time < metadata.endBeat } })),
			);
		});
		builder.addCase(deselectAllEntities, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addCase(selectAllEntitiesInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= start && x.time < end } })),
			);
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
				const eventTrackIndex = allTracks.findIndex((id) => Number.parseInt(id) === event.type);
				const isInSelectionBox = eventTrackIndex >= selectionBoxInBeats.startTrackIndex && eventTrackIndex <= selectionBoxInBeats.endTrackIndex;
				adapter.updateOne(state, { id: adapter.selectId(event), changes: { selected: isInSelectionBox || (selectionBoxInBeats.withPrevious && event.selected) } });
			}
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAllSelected(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: nudgeItem(x, direction, amount) })),
			);
		});
		builder.addMatcher(isAnyOf(addSong, startLoadingMap), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(removeEvent, bulkRemoveEvent), (state, action) => {
			const { query, tracks, areLasersLocked } = action.payload;
			adapter.removeOne(state, resolveEventId(query));
			if (areLasersLocked && isMirroredTrack(query.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(query.type, tracks);
				adapter.removeOne(state, resolveEventId({ time: query.time, type: mirrorTrackId }));
			}
		});
		builder.addMatcher(isAnyOf(selectEvent, deselectEvent), (state, action) => {
			const { query, tracks, areLasersLocked } = action.payload;
			const match = selectEventByPosition(state, query);
			if (!match) return state;
			const selected = selectEvent.match(action);
			adapter.updateOne(state, { id: adapter.selectId(match), changes: { selected: selected } });
			if (areLasersLocked && isMirroredTrack(query.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(query.type, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: query.time, type: mirrorTrackId }), changes: { selected: selected } });
			}
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
