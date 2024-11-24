import { type EntityId, createSlice, isAnyOf } from "@reduxjs/toolkit";

import { EVENT_TRACKS } from "$/constants";
import { isLightEvent, nudgeEvents } from "$/helpers/events.helpers";
import { getBeatNumForItem } from "$/helpers/item.helpers";
import {
	bulkDeleteEvent,
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
	selectAll,
	selectAllInRange,
	selectEvent,
	startLoadingSong,
	switchEventColor,
} from "$/store/actions";
import { App, View } from "$/types";

const initialState = {} as Record<App.TrackId, App.BasicEvent[]>;

function createInitialState() {
	return EVENT_TRACKS.reduce(
		(acc, track) => {
			acc[track.id] = [];
			return acc;
		},
		{} as typeof initialState,
	);
}

function getSymmetricalId(id: EntityId) {
	return `${id}-mirrored`;
}

/**
 * In addition to returning an index so that the caller knows where to insert the event,
 * this method also returns whether or not there is already an event at the exact same beatNum.
 */
function findIndexForNewEvent<T extends App.BasicEvent>(beatNum: number, relevantEvents: T[]) {
	// Find the spot for this event. All events should be added in chronological order.
	let indexToInsertAt = 0;
	let eventOverlaps = false;
	for (let i = relevantEvents.length - 1; i >= 0; i--) {
		const event = relevantEvents[i];
		if (event.beatNum === beatNum) {
			eventOverlaps = true;
			indexToInsertAt = i;
			break;
		}
		// If this event is before our new one, we can insert it right after
		if (event.beatNum < beatNum) {
			indexToInsertAt = i + 1;
			break;
		}
	}

	return [indexToInsertAt, eventOverlaps] as [index: number, overlaps: boolean];
}

/**
 * Iterate through all tracks and mark all events as deselected.
 *
 * WARNING: This method mutates the argument passed in. It's meant to be used within a `produce` callback.
 */
const deselectAllEvents = (draftState: typeof initialState) => {
	const trackIds = Object.keys(draftState) as App.TrackId[];
	for (const trackId of trackIds) {
		for (const event of draftState[trackId]) {
			event.selected = false;
		}
	}
	return draftState;
};

function filterEventsBeforeBeat<T extends App.BasicEvent>(tracks: typeof initialState, trackId: App.TrackId, beforeBeat: number) {
	return tracks[trackId].filter((event) => event.beatNum < beforeBeat) as T[];
}

const slice = createSlice({
	name: "tracks",
	initialState: initialState,
	selectors: {
		getTracks: (state) => state,
		getEvents: (state) => Object.values(state).flat(),
		getAllEventsAsArray: (state) => {
			const flatEventsArray = Object.values(state).flat();
			// Sort the array so that events aren't grouped by track, but instead are wholly chronological
			return flatEventsArray.sort((a, b) => a.beatNum - b.beatNum);
		},
		getSelectedEvents: (state) => {
			const allEvents = Object.values(state).flat();
			return allEvents.filter((event) => event.selected);
		},
		getEventForTrackAtBeat: (state, trackId: App.TrackId, startBeat: number) => {
			const relevantEvents = filterEventsBeforeBeat(state, trackId, startBeat);
			if (relevantEvents.length === 0) return null;
			return relevantEvents[relevantEvents.length - 1];
		},
		getTrackSpeedAtBeat: (state, trackId: App.TrackId, beatNum: number) => {
			const events = filterEventsBeforeBeat<App.IBasicValueEvent>(state, trackId, beatNum).reverse();
			if (!events.length) return 0;
			return events[0].laserSpeed;
		},
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadBeatmapEntities, (state, action) => {
			const { events } = action.payload;
			if (!events || events.length === 0) return createInitialState();
			// MAYBE TEMP:
			// I'm noticing some weird bug where I get SO MANY EVENTS. Remove all duplicates.
			const uniqueEvents: App.BasicEvent[] = [];
			for (const event of events) {
				const alreadyExists = uniqueEvents.some((uniqEvent) => {
					return uniqEvent.trackId === event.trackId && uniqEvent.beatNum === event.beatNum;
				});
				if (!alreadyExists) {
					uniqueEvents.push(event);
				}
			}
			// Entities are loaded all in 1 big array, since that's how they're saved to disk. Reduce them into a map based on trackId
			const initialState = createInitialState();
			const tracks = uniqueEvents.reduce((acc, event) => {
				if (!event) return acc;
				acc[event.trackId].push(event);
				return acc;
			}, initialState);
			return { ...state, ...tracks };
		});
		builder.addCase(placeEvent, (state, action) => {
			const { id, trackId, beatNum, eventType, eventColorType, areLasersLocked } = action.payload;
			const newEvent = { id, trackId, beatNum, type: eventType } as App.BasicEvent;
			if (isLightEvent(newEvent)) {
				newEvent.colorType = eventColorType;
			}
			const relevantEvents = state[trackId];
			const [indexToInsertAt, eventOverlaps] = findIndexForNewEvent(beatNum, relevantEvents);
			// Don't allow multiple blocks in the same cell. Rather than overwrite, this strategy allows us to easily "fill gaps" by dragging over an area
			if (eventOverlaps) return state;
			state[trackId].splice(indexToInsertAt, 0, newEvent);
			// Important: if the side lasers are "locked" we need to mimic this event from the left laser to the right laser.
			if (areLasersLocked && trackId === App.TrackId[2]) {
				const mirrorTrackId = App.TrackId[3];
				const symmetricalEvent = { ...newEvent, id: getSymmetricalId(newEvent.id), trackId: mirrorTrackId } as typeof newEvent;
				const relevantEvents = state[mirrorTrackId];
				const [indexToInsertAt, eventOverlaps] = findIndexForNewEvent(beatNum, relevantEvents);
				if (eventOverlaps) return;
				state[mirrorTrackId].splice(indexToInsertAt, 0, symmetricalEvent);
			}
		});
		builder.addCase(changeLaserSpeed, (state, action) => {
			const { id, trackId, beatNum, speed, areLasersLocked } = action.payload;
			const newEvent = { id, trackId, beatNum, laserSpeed: speed } as App.IBasicValueEvent;
			const relevantEvents = state[trackId];
			const [indexToInsertAt, eventOverlaps] = findIndexForNewEvent(beatNum, relevantEvents);
			const numToRemove = eventOverlaps ? 1 : 0;
			state[trackId].splice(indexToInsertAt, numToRemove, newEvent);
			// Repeat all the above stuff for the laserSpeedRight track, if we're modifying the left track and have locked the lasers together.
			if (areLasersLocked && trackId === App.TrackId[12]) {
				const symmetricalTrackId = App.TrackId[13];
				const symmetricalEvent = { ...newEvent, id: getSymmetricalId(newEvent.id), trackId: symmetricalTrackId };
				const relevantEvents = state[symmetricalTrackId];
				const [indexToInsertAt, eventOverlaps] = findIndexForNewEvent(beatNum, relevantEvents);
				const numToRemove = eventOverlaps ? 1 : 0;
				state[symmetricalTrackId].splice(indexToInsertAt, numToRemove, symmetricalEvent);
			}
		});
		builder.addCase(deleteSelectedEvents, (state) => {
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				state[trackId] = state[trackId].filter((event) => !event.selected);
			}
		});
		builder.addCase(cutSelection.fulfilled, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				state[trackId] = state[trackId].filter((event) => !event.selected);
			}
		});
		builder.addCase(pasteSelection.fulfilled, (state, action) => {
			const { view, data, deltaBetweenPeriods } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			if (!data.events) return state;
			deselectAllEvents(state);
			const timeShiftedData = data.events.map((event) => ({ ...event, selected: true, beatNum: getBeatNumForItem(event) + deltaBetweenPeriods }) as App.BasicEvent);
			for (const event of timeShiftedData) {
				// Shift the event by the delta between
				state[event.trackId].push(event);
			}
		});
		builder.addCase(switchEventColor, (state, action) => {
			const { id, trackId } = action.payload;
			const eventIndex = state[trackId].findIndex((ev) => ev.id === id);
			const event = state[trackId][eventIndex];
			if (!isLightEvent(event)) return state;
			event.colorType = event.colorType === App.EventColor.SECONDARY ? App.EventColor.PRIMARY : App.EventColor.SECONDARY;
		});
		builder.addCase(selectAll.fulfilled, (state, action) => {
			const { view, metadata } = action.payload;
			if (view !== View.LIGHTSHOW || !metadata) return state;
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				// Set all events within our frame as selected, and deselect any selected events outside of it
				for (const event of state[trackId]) {
					const shouldBeSelected = event.beatNum >= metadata.startBeat && event.beatNum < metadata.endBeat;
					event.selected = shouldBeSelected;
				}
			}
		});
		builder.addCase(deselectAll, (state, action) => {
			const { view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			deselectAllEvents(state);
		});
		builder.addCase(selectAllInRange, (state, action) => {
			const { start, end, view } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				// Set all events within our frame as selected, and deselect any selected events outside of it
				for (const event of state[trackId]) {
					const shouldBeSelected = event.beatNum >= start && event.beatNum < end;
					event.selected = shouldBeSelected;
				}
			}
		});
		builder.addCase(commitSelection, (state) => {
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				for (const event of state[trackId]) {
					if (event.tentative === true) {
						event.selected = true;
					}
				}
			}
		});
		builder.addCase(drawSelectionBox.fulfilled, (state, action) => {
			const { selectionBoxInBeats, metadata } = action.payload;
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				const trackIndex = EVENT_TRACKS.findIndex((track) => track.id === trackId);
				const isTrackIdWithinBox = trackIndex >= selectionBoxInBeats.startTrackIndex && trackIndex <= selectionBoxInBeats.endTrackIndex;
				for (const event of state[trackId]) {
					const isInWindow = event.beatNum >= metadata.window.startBeat && event.beatNum <= metadata.window.endBeat;
					if (!isInWindow) return;
					const isInSelectionBox = isTrackIdWithinBox && event.beatNum >= selectionBoxInBeats.startBeat && event.beatNum <= selectionBoxInBeats.endBeat;
					if (isInSelectionBox) {
						event.tentative = true;
					} else {
						if (event.tentative === true) {
							event.selected = false;
						}
					}
				}
			}
		});
		builder.addCase(nudgeSelection.fulfilled, (state, action) => {
			const { view, direction, amount } = action.payload;
			if (view !== View.LIGHTSHOW) return state;
			const trackIds = Object.keys(state) as App.TrackId[];
			for (const trackId of trackIds) {
				nudgeEvents(direction, amount, state[trackId]);
			}
		});
		builder.addMatcher(isAnyOf(createNewSong.fulfilled, startLoadingSong), () => createInitialState());
		builder.addMatcher(isAnyOf(deleteEvent, bulkDeleteEvent), (state, action) => {
			const { id, trackId, areLasersLocked } = action.payload;
			state[trackId] = state[trackId].filter((ev) => ev.id !== id);
			const mirroredTracks = [App.TrackId[2], App.TrackId[12]] as App.TrackId[];
			if (areLasersLocked && mirroredTracks.includes(trackId)) {
				const mirroredTrackId = trackId.replace("Left", "Right") as App.TrackId;
				state[mirroredTrackId] = state[mirroredTrackId].filter((ev) => ev.id !== getSymmetricalId(id));
			}
		});
		builder.addMatcher(isAnyOf(selectEvent, deselectEvent), (state, action) => {
			const { id, trackId } = action.payload;
			const eventIndex = state[trackId].findIndex((ev) => ev.id === id);
			state[trackId][eventIndex].selected = selectEvent.match(action);
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
