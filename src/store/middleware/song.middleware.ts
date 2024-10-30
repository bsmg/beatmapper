import { createListenerMiddleware } from "@reduxjs/toolkit";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { HIGHEST_PRECISION } from "$/constants";
import { convertBeatsToMilliseconds, convertMillisecondsToBeats, getWaveformDataForFile, snapToNearestBeat } from "$/helpers/audio.helpers";
import { convertBookmarksToRedux } from "$/helpers/bookmarks.helpers";
import { convertEventsToExportableJson, convertEventsToRedux } from "$/helpers/events.helpers";
import { convertFileToArrayBuffer } from "$/helpers/file.helpers";
import { convertNotesFromMappingExtensions } from "$/helpers/notes.helpers";
import { convertObstaclesToRedux } from "$/helpers/obstacles.helpers";
import { AudioSample } from "$/services/audio.service";
import { FileType, deleteAllSongFiles, deleteFile, getBeatmap, getFile, getFilenameForThing, saveBeatmap, saveFile, saveInfoDat } from "$/services/file.service";
import { createBeatmapContents, createInfoContent } from "$/services/packaging.service";
import { shiftEntitiesByOffset, unshiftEntitiesByOffset } from "$/services/packaging.service.nitty-gritty";
import { Sfx } from "$/services/sfx.service";
import {
	adjustCursorPosition,
	copyDifficulty,
	createDifficulty,
	deleteBeatmap,
	deleteSong,
	finishLoadingSong,
	jumpToBeat,
	leaveEditor,
	loadBeatmapEntities,
	pausePlaying,
	reloadWaveform,
	scrollThroughSong,
	scrubEventsHeader,
	scrubWaveform,
	seekBackwards,
	seekForwards,
	selectAllInRange,
	skipToEnd,
	skipToStart,
	startLoadingSong,
	startPlaying,
	stopPlaying,
	tick,
	togglePlaying,
	updatePlaybackSpeed,
	updateSongDetails,
	updateVolume,
} from "$/store/actions";
import { getAllEventsAsArray, getBeatsPerZoomLevel, getCursorPosition, getCursorPositionInBeats, getDuration, getIsLockedToCurrentWindow, getNotes, getPlayNoteTick, getPlaybackRate, getProcessingDelay, getSelectedSong, getSnapTo, getSongById, getVolume } from "$/store/selectors";
import type { RootState } from "$/store/setup";
import { type Json, View } from "$/types";
import { clamp, floorToNearest, roundToNearest } from "$/utils";

function stopAndRewindAudio(audioSample: AudioSample, offset: number) {
	audioSample.setCurrentTime((offset || 0) / 1000);
}

function triggerTickerIfNecessary(state: RootState, currentBeat: number, lastBeat: number, ticker: Sfx, processingDelay: number) {
	const song = getSelectedSong(state);
	const playNoteTick = getPlayNoteTick(state);
	if (playNoteTick) {
		const delayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);
		const anyNotesWithinTimespan = getNotes(state).some((note) => note._time - delayInBeats >= lastBeat && note._time - delayInBeats < currentBeat && note._type !== 3);
		if (anyNotesWithinTimespan) {
			ticker.trigger();
		}
	}
}

function calculateIfPlaybackShouldBeCommandeered(state: RootState, currentBeat: number, lastBeat: number, processingDelay: number, view: View | null) {
	if (view !== View.LIGHTSHOW) return;
	const song = getSelectedSong(state);
	const isLockedToCurrentWindow = getIsLockedToCurrentWindow(state);
	const beatsPerZoomLevel = getBeatsPerZoomLevel(state);
	// Figure out how much time lasts between frames, on average.
	const currentTime = convertBeatsToMilliseconds(currentBeat, song.bpm);
	const lastBeatTime = convertBeatsToMilliseconds(lastBeat, song.bpm);
	const deltaInMillisecondsBetweenFrames = currentTime - lastBeatTime;
	const processingDelayInBeats = convertMillisecondsToBeats(processingDelay, song.bpm);
	const windowForCurrentBeat = floorToNearest(currentBeat + processingDelayInBeats, beatsPerZoomLevel);
	const windowForLastBeat = floorToNearest(lastBeat + processingDelayInBeats, beatsPerZoomLevel);
	const justExceededWindow = windowForLastBeat < windowForCurrentBeat && deltaInMillisecondsBetweenFrames < 100;
	if (isLockedToCurrentWindow && justExceededWindow) {
		const newCursorPosition = convertBeatsToMilliseconds(windowForLastBeat, song.bpm) + song.offset;
		return newCursorPosition;
	}
}

/**
 * This middleware manages playback concerns.
 */
export default function createSongMiddleware() {
	let animationFrameId: number;

	const ticker = new Sfx();
	const audioSample = new AudioSample(1, 1);

	const instance = createListenerMiddleware<RootState>();

	instance.startListening({
		actionCreator: startLoadingSong,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songId, difficulty } = action.payload;
			const state = api.getState();
			const song = getSongById(state, songId);
			const volume = getVolume(state);
			const playbackRate = getPlaybackRate(state);
			if (!song) {
				console.error(`Song "${songId}" not found. Current state:`, state);
				return;
			}
			// Fetch the json for this beatmap from our local store.
			let beatmapJson: Json.Beatmap | null = null;
			try {
				beatmapJson = await getBeatmap(songId, difficulty);
			} catch (err) {
				console.error(err);
			}
			// we may not have any beatmap entities, if this is a new song or new difficulty.
			if (beatmapJson) {
				let notes = beatmapJson._notes;
				// If this song uses mapping extensions, the note values will be in the thousands. We need to pull them down to the normal range.
				if (song.modSettings.mappingExtensions?.isEnabled) {
					notes = convertNotesFromMappingExtensions(notes);
				}
				// If we do, we need to manage a little dance related to offsets.
				// See offsets.md for more context, but essentially we need to transform our timing to match the beat, by undoing a transformation previously applied.
				let unshiftedNotes = unshiftEntitiesByOffset(notes || [], song.offset, song.bpm);
				const unshiftedEvents = unshiftEntitiesByOffset(beatmapJson._events || [], song.offset, song.bpm);
				const unshiftedObstacles = unshiftEntitiesByOffset(beatmapJson._obstacles || [], song.offset, song.bpm);
				// Round all notes, so that no floating-point imprecision drift happens
				unshiftedNotes = unshiftedNotes.map((note) => {
					return { ...note, _time: roundToNearest(note._time, HIGHEST_PRECISION) };
				});
				// Our beatmap comes in a "raw" form, using proprietary fields.
				// At present, I'm using that proprietary structure for notes/mines, but I have my own structure for obstacles and events.
				// So I need to convert the ugly JSON format to something manageable.
				const convertedObstacles = convertObstaclesToRedux(unshiftedObstacles as Json.Obstacle[]);
				const convertedEvents = convertEventsToRedux(unshiftedEvents as Json.Event[]);
				const convertedBookmarks = beatmapJson._customData?._bookmarks ? convertBookmarksToRedux(beatmapJson._customData._bookmarks) : [];
				api.dispatch(loadBeatmapEntities({ notes: unshiftedNotes as Json.Note[], events: convertedEvents, obstacles: convertedObstacles, bookmarks: convertedBookmarks }));
				api.dispatch(ReduxUndoActionCreators.clearHistory());
			}
			const file = await getFile<Blob>(song.songFilename);
			if (!file) return;
			const arrayBuffer = await convertFileToArrayBuffer(file);
			await audioSample.load(arrayBuffer);
			audioSample.changeVolume(volume);
			audioSample.changePlaybackRate(playbackRate);
			audioSample.setCurrentTime(song.offset / 1000);
			const waveform = await getWaveformDataForFile(file);
			api.dispatch(finishLoadingSong({ song, waveformData: waveform }));
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: createDifficulty,
		effect: async (action, api) => {
			const { difficulty, afterCreate } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const events = convertEventsToExportableJson(getAllEventsAsArray(state));
			const shiftedEvents = shiftEntitiesByOffset(events, song.offset, song.bpm);
			// No notes/obstacles/bookmarks by default, but copy the lighting
			const beatmapContents = createBeatmapContents({ notes: [], obstacles: [], events: shiftedEvents, bookmarks: [] }, { version: 2 });
			const beatmapFilename = getFilenameForThing(song.id, FileType.BEATMAP, { difficulty });
			await saveFile(beatmapFilename, beatmapContents);
			if (typeof afterCreate === "function") {
				afterCreate(difficulty);
			}
		},
	});
	instance.startListening({
		actionCreator: copyDifficulty,
		effect: async (action, api) => {
			const state = api.getState();
			const { songId, fromDifficultyId, toDifficultyId, afterCopy } = action.payload;
			// First, we need to load the file which contains the notes, events, etc for the difficulty we want to copy.
			const sourceDifficultyFileContents = await getBeatmap(songId, fromDifficultyId);
			// Save it to our destination difficulty.
			await saveBeatmap(songId, toDifficultyId, JSON.stringify(sourceDifficultyFileContents));
			// Pull that updated redux state and save it to our Info.dat
			const song = getSongById(state, songId);
			// Back up our latest data!
			await saveInfoDat(song.id, createInfoContent(song, { version: 2 }));
			if (typeof afterCopy === "function") {
				afterCopy(toDifficultyId);
			}
		},
	});
	instance.startListening({
		actionCreator: togglePlaying,
		effect: (_, api) => {
			const state = api.getState();
			if (state.navigation.isPlaying) {
				api.dispatch(pausePlaying());
			} else {
				api.dispatch(startPlaying());
			}
		},
	});
	instance.startListening({
		actionCreator: startPlaying,
		effect: (_, api) => {
			api.unsubscribe();
			audioSample.play();
			// Keep track of the last beat we saw, so we know which chunk of time the current tick is accessing (by looking at the delta between last and current)
			let lastBeat = 0;
			function onTick() {
				const currentTime = audioSample.getCurrentTime() * 1000;
				const state = api.getState();
				const song = getSelectedSong(state);
				const duration = getDuration(state);
				if (audioSample.isPlaying && duration && currentTime > duration) {
					return api.dispatch(pausePlaying());
				}
				const processingDelay = getProcessingDelay(state);
				const currentBeat = convertMillisecondsToBeats(currentTime - song.offset, song.bpm);
				triggerTickerIfNecessary(state, currentBeat, lastBeat, ticker, processingDelay);
				// Normally, we just want to have one frame after another, with no overriding behavior. Sometimes, though, we want to commandeer.
				// Specifically, this can be when the user enables the "Loop" lock in the event grid.
				// When the time reaches the end of the current window, it's commandeered and reset to the start of that window.
				const viewMatch = window.location.pathname.match(/\/(\w+)$/);
				const view = viewMatch ? (viewMatch[1] as View) : null;
				const commandeeredCursorPosition = calculateIfPlaybackShouldBeCommandeered(state, currentBeat, lastBeat, processingDelay, view);
				if (typeof commandeeredCursorPosition === "number") {
					api.dispatch(adjustCursorPosition({ newCursorPosition: commandeeredCursorPosition }));
					audioSample.setCurrentTime(commandeeredCursorPosition / 1000);
				} else {
					api.dispatch(tick({ timeElapsed: currentTime }));
				}
				lastBeat = currentBeat;
				animationFrameId = window.requestAnimationFrame(() => onTick());
			}
			animationFrameId = window.requestAnimationFrame(() => onTick());
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrubWaveform,
		effect: (action, api) => {
			api.unsubscribe();
			const { newOffset } = action.payload;
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let roundedCursorPosition = snapToNearestBeat(newOffset, song.bpm, song.offset);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(adjustCursorPosition({ newCursorPosition: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateSongDetails,
		effect: async (action, api) => {
			api.unsubscribe();
			const { songFilename, offset } = action.payload;
			// It's possible we updated the song file. We should reload it, so that the audio is properly updated.
			if (songFilename) {
				const file = await getFile<Blob>(songFilename);
				if (!file) return;
				const arrayBuffer = await convertFileToArrayBuffer(file);
				await audioSample.load(arrayBuffer);
				audioSample.setCurrentTime((offset ?? 0) / 1000);
				const waveform = await getWaveformDataForFile(file);
				api.dispatch(reloadWaveform({ waveformData: waveform }));
			}
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrubEventsHeader,
		effect: (action, api) => {
			api.unsubscribe();
			const { selectedBeat } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let newCursorPosition = convertBeatsToMilliseconds(selectedBeat, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: selectAllInRange,
		effect: (action, api) => {
			api.unsubscribe();
			const { start } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const newCursorPosition = convertBeatsToMilliseconds(start, song.bpm) + song.offset;
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			audioSample.pause();
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: jumpToBeat,
		effect: (action, api) => {
			api.unsubscribe();
			const { beatNum, pauseTrack } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			let newCursorPosition = convertBeatsToMilliseconds(beatNum, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration ?? newCursorPosition);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			if (pauseTrack) {
				audioSample.pause();
			}
			api.subscribe();
		},
	});
	instance.startListening({
		matcher: (action) => seekForwards.match(action) || seekBackwards.match(action),
		effect: (action, api) => {
			api.unsubscribe();
			const { view } = action.payload;
			const state = api.getState();
			const song = getSelectedSong(state);
			const cursorPositionInBeats = getCursorPositionInBeats(state);
			const duration = getDuration(state);
			if (cursorPositionInBeats === null || duration === null) return;
			// In events view, we always want to jump ahead to the next window. This is a bit tricky since it's not a fixed # of cells to jump.
			const beatsPerZoomLevel = getBeatsPerZoomLevel(state);
			const windowSize = view === View.LIGHTSHOW ? beatsPerZoomLevel : 32;
			const currentWindowIndex = Math.floor(cursorPositionInBeats / windowSize);
			let newStartBeat: number;
			if (seekForwards.match(action)) {
				newStartBeat = windowSize * (currentWindowIndex + 1);
			} else {
				// In notes view, this should work like the next/previous buttons on CD players.
				// If you click 'previous', it "rewinds" to the start of the current window, unless you're in the first couple beats, in which case it rewinds to the previous window.
				const progressThroughWindow = cursorPositionInBeats % windowSize;
				if (progressThroughWindow < 2) {
					newStartBeat = windowSize * (currentWindowIndex - 1);
				} else {
					newStartBeat = windowSize * currentWindowIndex;
				}
			}
			let newCursorPosition = convertBeatsToMilliseconds(newStartBeat, song.bpm) + song.offset;
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: scrollThroughSong,
		effect: (action, api) => {
			api.unsubscribe();
			// If the song isn't loaded yet, ignore this action. This can happen if the user starts scrolling before the song has loaded.
			if (!audioSample) return;
			const state = api.getState();
			const song = getSelectedSong(state);
			const snapTo = getSnapTo(state);
			const cursorPosition = getCursorPosition(state);
			const duration = getDuration(state);
			if (duration === null) return;
			const { direction } = action.payload;
			// We want to jump by the amount that we're snapping to.
			const incrementInMs = convertBeatsToMilliseconds(snapTo, song.bpm);
			let newCursorPosition = direction === "forwards" ? cursorPosition + incrementInMs : cursorPosition - incrementInMs;
			newCursorPosition = clamp(newCursorPosition, 0, duration);
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: leaveEditor,
		effect: (_, api) => {
			api.unsubscribe();
			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();
			audioSample.setCurrentTime(0);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: pausePlaying,
		effect: (_, api) => {
			api.unsubscribe();
			// When the song is playing, `cursorPosition` is fluid, moving every 16 milliseconds to a new fractional value.
			// Once we stop, we want to snap to the nearest beat.
			const state = api.getState();
			const song = getSelectedSong(state);
			const cursorPosition = getCursorPosition(state);
			const duration = getDuration(state);
			window.cancelAnimationFrame(animationFrameId);
			audioSample.pause();
			let roundedCursorPosition = snapToNearestBeat(cursorPosition, song.bpm, song.offset);
			roundedCursorPosition = clamp(roundedCursorPosition, 0, duration ?? roundedCursorPosition);
			// Dispatch this new cursor position, but also seek to this place in the audio, so that it is in sync.
			api.dispatch(adjustCursorPosition({ newCursorPosition: roundedCursorPosition }));
			audioSample.setCurrentTime(roundedCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: stopPlaying,
		effect: (action, api) => {
			api.unsubscribe();
			const { offset } = action.payload;
			window.cancelAnimationFrame(animationFrameId);
			if (audioSample) {
				audioSample.pause();
				stopAndRewindAudio(audioSample, offset);
			}
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: skipToStart.fulfilled,
		effect: (action, api) => {
			api.unsubscribe();
			const { offset } = action.payload;
			audioSample.setCurrentTime(offset / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: skipToEnd,
		effect: (_, api) => {
			api.unsubscribe();
			// Rather than go to the literal last millisecond in the song, we'll jump 2 bars away from the very end. That seems most likely to be useful.
			const state = api.getState();
			const song = getSelectedSong(state);
			const duration = getDuration(state);
			if (duration === null) return;
			const lastBeatInSong = Math.floor(convertMillisecondsToBeats(duration, song.bpm));
			const newCursorPosition = convertBeatsToMilliseconds(lastBeatInSong - 8, song.bpm) + song.offset;
			api.dispatch(adjustCursorPosition({ newCursorPosition }));
			audioSample.setCurrentTime(newCursorPosition / 1000);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updateVolume,
		effect: (action, api) => {
			api.unsubscribe();
			const { volume } = action.payload;
			audioSample.changeVolume(volume);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: updatePlaybackSpeed,
		effect: (action, api) => {
			api.unsubscribe();
			const { playbackRate } = action.payload;
			audioSample.changePlaybackRate(playbackRate);
			api.subscribe();
		},
	});
	instance.startListening({
		actionCreator: deleteBeatmap,
		effect: async (action) => {
			const { songId, difficulty } = action.payload;
			// Our reducer will handle the redux state part, but we also need to delete the corresponding beatmap from the filesystem.
			const beatmapFilename = getFilenameForThing(songId, FileType.BEATMAP, { difficulty });
			await deleteFile(beatmapFilename);
		},
	});
	instance.startListening({
		actionCreator: deleteSong,
		effect: (action, api) => {
			const state = api.getState();
			const { songId } = action.payload;
			const song = getSongById(state, songId);
			deleteAllSongFiles(song);
		},
	});

	return instance.middleware;
}
