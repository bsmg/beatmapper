import { type EntityId, createDraftSafeSelector, createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";

import { getMirroredTrack, isLightEvent, isMirroredTrack, resolveEventId } from "$/helpers/events.helpers";
import { nudgeItem, resolveBeatForItem } from "$/helpers/item.helpers";
import {
	bulkDeleteEvent,
	bulkPlaceEvent,
	changeLaserSpeed,
	commitSelection,
	createNewSong,
	cutSelection,
	deleteEvent,
	deleteSelectedEvents,
	deselectAll,
	deselectEvent,
	drawSelectionBox,
	loadBeatmapEntities,
	nudgeSelection,
	pasteSelection,
	placeEvent,
	selectAll as selectAllEntities,
	selectAllInRange,
	selectEvent,
	startLoadingSong,
	switchEventColor,
} from "$/store/actions";
import { createSelectedEntitiesSelector } from "$/store/helpers";
import { App, View } from "$/types";
import { cycle } from "$/utils";

const adapter = createEntityAdapter<App.BasicEvent, EntityId>({
	selectId: resolveEventId,
});
const { selectAll, selectById } = adapter.getSelectors();
const selectAllSelected = createSelectedEntitiesSelector(selectAll);
const selectAllForTrack = createDraftSafeSelector([selectAll, (_, trackId: App.TrackId) => trackId], (state, trackId) => {
	return state.filter((x) => x.trackId === trackId);
});
const selectAllForTrackBeforeBeat = createDraftSafeSelector([selectAll, (_, query: { trackId: App.TrackId; beforeBeat: number }) => query], (state, { trackId, beforeBeat }) => {
	return state.filter((x) => x.trackId === trackId && x.beatNum < beforeBeat);
});

const slice = createSlice({
	name: "tracks",
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
			const events = state as App.IBasicValueEvent[];
			if (!events.length) return 0;
			return events[0].laserSpeed;
		}),
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { events } = action.payload;
			return adapter.setAll(state, events ?? []);
		});
		builder.addCase(changeLaserSpeed, (state, action) => {
			const { beatNum, trackId, speed, areLasersLocked } = action.payload;
			const newEvent = { id: resolveEventId({ beatNum, trackId } as App.IBasicValueEvent), trackId, beatNum, laserSpeed: speed } as App.IBasicValueEvent;
			adapter.upsertOne(state, newEvent);
			// Repeat all the above stuff for the laserSpeedRight track, if we're modifying the left track and have locked the lasers together.
			if (areLasersLocked && isMirroredTrack(newEvent.trackId)) {
				const mirrorTrackId = getMirroredTrack(newEvent.trackId);
				const symmetricalEvent = { ...newEvent, id: resolveEventId({ beatNum, trackId: mirrorTrackId }), trackId: mirrorTrackId };
				adapter.upsertOne(state, symmetricalEvent as App.IBasicValueEvent);
			}
		});
		builder.addCase(switchEventColor, (state, action) => {
			const { beatNum, trackId, areLasersLocked } = action.payload;
			const match = selectById(state, resolveEventId({ beatNum, trackId }));
			if (!match) return state;
			if (!isLightEvent(match)) return state;
			const color = cycle(Object.values(App.EventColor).slice(0, -1), match.colorType);
			adapter.updateOne(state, { id: adapter.selectId(match), changes: { colorType: color } });
			if (areLasersLocked && isMirroredTrack(match.trackId)) {
				const mirrorTrackId = getMirroredTrack(match.trackId);
				adapter.updateOne(state, { id: resolveEventId({ beatNum, trackId: mirrorTrackId }), changes: { colorType: color } });
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
			const timeShiftedEntities = data.events.map((x) => ({ ...x, selected: true, beatNum: resolveBeatForItem(x) + deltaBetweenPeriods }) as App.BasicEvent);
			return adapter.upsertMany(state, timeShiftedEntities);
		});
		builder.addCase(selectAllEntities.fulfilled, (state, action) => {
			const { view, metadata } = action.payload;
			if (view !== View.LIGHTSHOW || !metadata) return state;
			const entities = selectAll(state);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.beatNum >= metadata.startBeat && x.beatNum < metadata.endBeat } })),
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
				entities.map((x) => ({ id: adapter.selectId(x), changes: { selected: x.beatNum >= start && x.beatNum < end } })),
			);
		});
		builder.addCase(commitSelection, (state) => {
			const entities = selectAll(state).filter((x) => x.tentative === true);
			return adapter.updateMany(
				state,
				entities.map((x) => ({ id: adapter.selectId(x), changes: { tentative: undefined, selected: true } })),
			);
		});
		builder.addCase(drawSelectionBox.fulfilled, (state, action) => {
			const { tracks, selectionBoxInBeats, metadata } = action.payload;
			const trackIds = tracks.map((x) => x.id) as App.TrackId[];
			for (const trackId of trackIds) {
				const trackIndex = tracks.findIndex((track) => track.id === trackId);
				const isTrackIdWithinBox = trackIndex >= selectionBoxInBeats.startTrackIndex && trackIndex <= selectionBoxInBeats.endTrackIndex;
				for (const event of selectAll(state)) {
					const isInWindow = event.beatNum >= metadata.window.startBeat && event.beatNum <= metadata.window.endBeat;
					if (!isInWindow) return;
					const isInSelectionBox = isTrackIdWithinBox && event.beatNum >= selectionBoxInBeats.startBeat && event.beatNum <= selectionBoxInBeats.endBeat;
					if (isInSelectionBox) {
						adapter.updateOne(state, { id: adapter.selectId(event), changes: { tentative: true } });
					} else {
						if (event.tentative) {
							adapter.updateOne(state, { id: adapter.selectId(event), changes: { tentative: false, selected: true } });
						}
					}
				}
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
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong), () => adapter.getInitialState());
		builder.addMatcher(isAnyOf(placeEvent, bulkPlaceEvent), (state, action) => {
			const { beatNum, trackId, eventType, eventColorType, areLasersLocked } = action.payload;
			const newEvent = { id: resolveEventId({ beatNum, trackId }), beatNum, trackId, type: eventType } as App.BasicEvent;
			if (isLightEvent(newEvent)) {
				newEvent.colorType = eventColorType;
			}
			adapter.upsertOne(state, newEvent);
			if (areLasersLocked && isMirroredTrack(newEvent.trackId)) {
				// Important: if the side lasers are "locked" we need to mimic this event from the left laser to the right laser.
				const mirrorTrackId = getMirroredTrack(newEvent.trackId);
				const symmetricalEvent = { ...newEvent, id: resolveEventId({ beatNum, trackId: mirrorTrackId }), trackId: mirrorTrackId } as App.BasicEvent;
				adapter.upsertOne(state, symmetricalEvent);
			}
		});
		builder.addMatcher(isAnyOf(deleteEvent, bulkDeleteEvent), (state, action) => {
			const { beatNum, trackId, areLasersLocked } = action.payload;
			adapter.removeOne(state, resolveEventId({ beatNum, trackId }));
			if (areLasersLocked && isMirroredTrack(trackId)) {
				const mirrorTrackId = getMirroredTrack(trackId);
				adapter.removeOne(state, resolveEventId({ beatNum, trackId: mirrorTrackId }));
			}
		});
		builder.addMatcher(isAnyOf(selectEvent, deselectEvent), (state, action) => {
			const { beatNum, trackId, areLasersLocked } = action.payload;
			const selected = selectEvent.match(action);
			adapter.updateOne(state, { id: resolveEventId({ beatNum, trackId }), changes: { selected } });
			if (areLasersLocked && isMirroredTrack(trackId)) {
				const mirrorTrackId = getMirroredTrack(trackId);
				adapter.updateOne(state, { id: resolveEventId({ beatNum, trackId: mirrorTrackId }), changes: { selected } });
			}
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
