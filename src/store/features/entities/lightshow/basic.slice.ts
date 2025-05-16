import { type EntityId, type PayloadAction, createDraftSafeSelector, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { createBasicEvent, sortObjectFn } from "bsmap";

import { isLightEvent, isMirroredTrack, resolveEventDerivedProps, resolveEventId, resolveEventValue, resolveMirroredTrack } from "$/helpers/events.helpers";
import { nudgeItem, resolveTimeForItem } from "$/helpers/item.helpers";
import { commitSelection, createNewSong, cutSelection, deleteSelectedEvents, deselectAll, deselectEvent, drawSelectionBox, loadBeatmapEntities, nudgeSelection, pasteSelection, selectAll as selectAllEntities, selectAllInRange, selectEvent, startLoadingSong, switchEventColor } from "$/store/actions";
import { createSelectedEntitiesSelector } from "$/store/helpers";
import { App, type IEventTrack, View } from "$/types";
import { cycle } from "$/utils";

const adapter = createEntityAdapter<App.IBasicEvent, EntityId>({
	selectId: resolveEventId,
	sortComparer: sortObjectFn,
});
const { selectAll, selectById } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);
const selectAllForTrack = createDraftSafeSelector([selectAll, (_, trackId: App.TrackId) => trackId], (state, trackId) => {
	return state.filter((x) => x.type === trackId);
});
const selectAllForTrackBeforeBeat = createDraftSafeSelector([selectAll, (_, query: { trackId: App.TrackId; beforeBeat: number }) => query], (state, { trackId, beforeBeat }) => {
	return state.filter((x) => x.type === trackId && x.time < beforeBeat);
});

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
		selectTrackSpeedAtBeat: createDraftSafeSelector(selectAllForTrackBeforeBeat, (state) => {
			const { value } = state[0];
			if (!state.length) return 0;
			return value;
		}),
	},
	reducers: {
		addOne: (state, action: PayloadAction<{ tracks?: IEventTrack[]; areLasersLocked?: boolean; data: App.IBasicEvent }>) => {
			const { tracks, areLasersLocked, data } = action.payload;
			const newEvent = createBasicEvent({ ...data }) as App.IBasicEvent;
			adapter.upsertOne(state, newEvent);
			if (areLasersLocked && isMirroredTrack(newEvent.type, tracks)) {
				// Important: if the side lasers are "locked" we need to mimic this event from the left laser to the right laser.
				const mirrorTrackId = resolveMirroredTrack(newEvent.type, tracks);
				const symmetricalEvent = createBasicEvent({ ...newEvent, type: mirrorTrackId });
				adapter.upsertOne(state, symmetricalEvent);
			}
		},
		updateOne: (state, action: PayloadAction<{ query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTrack[]; areLasersLocked?: boolean; changes: Partial<App.IBasicEvent> }>) => {
			const { query, tracks, areLasersLocked, changes } = action.payload;
			const match = selectById(state, resolveEventId(query));
			if (!match) return state;
			adapter.updateOne(state, { id: adapter.selectId(match), changes });
			if (areLasersLocked && isMirroredTrack(match.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(match.type, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: query.time, type: mirrorTrackId }), changes });
			}
		},
		removeOne: (state, action: PayloadAction<{ query: Parameters<typeof resolveEventId>[0]; tracks?: IEventTrack[]; areLasersLocked?: boolean }>) => {
			const { query, tracks, areLasersLocked } = action.payload;
			adapter.removeOne(state, resolveEventId(query));
			if (areLasersLocked && isMirroredTrack(query.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(query.type, tracks);
				adapter.removeOne(state, resolveEventId({ time: query.time, type: mirrorTrackId }));
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { events } = action.payload;
			return adapter.setAll(state, events ?? []);
		});
		builder.addCase(switchEventColor, (state, action) => {
			const { beatNum, trackId, tracks, areLasersLocked } = action.payload;
			const match = selectById(state, resolveEventId({ time: beatNum, type: trackId }));
			if (!match) return state;
			if (!isLightEvent(match, tracks)) return state;
			const { effect, color } = resolveEventDerivedProps(match.value, { tracks, trackId });
			const mirrorableColors = Object.values(App.EventColor).slice(0, -1);
			const newColor = color && mirrorableColors.includes(color) ? cycle(mirrorableColors, color) : color;
			const newValue = resolveEventValue({ effect, color: newColor }, { tracks });
			adapter.updateOne(state, { id: adapter.selectId(match), changes: { value: newValue } });
			if (areLasersLocked && isMirroredTrack(match.type, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(match.type, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: beatNum, type: mirrorTrackId }), changes: { value: newValue } });
			}
		});
		builder.addCase(deleteSelectedEvents, (state) => {
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
		builder.addCase(deselectAll, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
			);
		});
		builder.addCase(selectAllInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.time >= start && x.time < end } })),
			);
		});
		builder.addCase(drawSelectionBox.fulfilled, (state, action) => {
			const { tracks, selectionBoxInBeats, metadata, join } = action.payload;
			const entities = selectAll(state);
			if (!join) {
				adapter.updateMany(
					state,
					entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: false } })),
				);
			}
			for (const event of entities) {
				const eventTrackIndex = tracks.findIndex((track) => track.id === event.type);
				const isInWindow = event.time >= metadata.window.startBeat && event.time <= metadata.window.endBeat;
				if (!isInWindow) return;
				const isInSelectionBox = event.time >= selectionBoxInBeats.startBeat && event.time <= selectionBoxInBeats.endBeat && eventTrackIndex >= selectionBoxInBeats.startTrackIndex && eventTrackIndex <= selectionBoxInBeats.endTrackIndex;
				adapter.updateOne(state, { id: adapter.selectId(event), changes: { tentative: isInSelectionBox } });
			}
		});
		builder.addCase(commitSelection, (state) => {
			const entities = selectAll(state).filter((x) => x.tentative === true);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { tentative: undefined, selected: true } })),
			);
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
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(selectEvent, deselectEvent), (state, action) => {
			const { beatNum, trackId, tracks, areLasersLocked } = action.payload;
			const selected = selectEvent.match(action);
			adapter.updateOne(state, { id: resolveEventId({ time: beatNum, type: trackId }), changes: { selected } });
			if (areLasersLocked && isMirroredTrack(trackId, tracks)) {
				const mirrorTrackId = resolveMirroredTrack(trackId, tracks);
				adapter.updateOne(state, { id: resolveEventId({ time: beatNum, type: mirrorTrackId }), changes: { selected } });
			}
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
