import { createAction, createAsyncThunk, type GetThunkAPI } from "@reduxjs/toolkit";
import { createAudioData, createBeatmap } from "bsmap";

import { createTimescaleFromAudioData, decodeAudioData, decodeWaveformData } from "$/helpers/audio.helpers";
import { deserializeBeatmapContents } from "$/helpers/packaging.helpers";
import { selectActiveView } from "$/store/helpers/route.helpers";
import type { AppThunkApiConfig } from "$/store/types";
import { createThunk, type GetShallowThunkAPI } from "$/store/utils/thunk.utils";
import type { BeatmapId, SongId } from "$/types";

export const startLoadingMap = createAction("startLoadingMap", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args }, meta: { hydrate: true, sync: true } };
});
export const finishLoadingMap = createAction("finishLoadingMap", (args: { songId: SongId }) => {
	return { payload: { ...args } };
});
export const leaveEditor = createAction("leaveEditor", (args: { songId: SongId; beatmapId: BeatmapId }) => {
	return { payload: { ...args } };
});

export const loadSongFile = createAsyncThunk("loadSongFile", async (args: { songId: SongId }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore" | "getAudioContext">>) => {
	const filestore = api.extra.getFilestore();
	const songFile = await filestore.loadSongFile(args.songId);

	const audioContext = api.extra.getAudioContext();
	const [audioBuffer, waveformData] = await Promise.all([decodeAudioData(songFile, audioContext), decodeWaveformData(songFile, audioContext)]);
	return api.fulfillWithValue({ duration: audioBuffer.duration, waveform: waveformData.toJSON() });
});
export const loadAudioDataContents = createAsyncThunk("loadAudioDataContents", async (args: { songId: SongId; options: { bpm: number } }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const filestore = api.extra.getFilestore();
	const contents = await filestore.loadAudioDataContents(args.songId).then(createAudioData);

	const timescale = createTimescaleFromAudioData(contents, args.options);
	return api.fulfillWithValue({ timescale });
});
export const loadBeatmapContents = createAsyncThunk("loadBeatmapContents", async (args: { songId: SongId; beatmapId: BeatmapId; options: Parameters<typeof deserializeBeatmapContents>[1] }, api: GetThunkAPI<AppThunkApiConfig<"getFilestore">>) => {
	const filestore = api.extra.getFilestore();
	const contents = await filestore.loadBeatmapContents(args.songId, args.beatmapId).then(createBeatmap);

	return api.fulfillWithValue({ entities: deserializeBeatmapContents(contents, args.options) });
});

export const cycleToNextTool = createThunk("cycleToNextTool", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
export const cycleToPrevTool = createThunk("cycleToPrevTool", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});

export const selectAllEntities = createThunk("selectAllEntities", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
export const selectAllEntitiesInRange = createThunk("selectAllEntitiesInRange", (args: { startBeat: number; endBeat: number }, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { ...args, view: selectActiveView(api.extra.getRouter()) };
});
export const deselectAllEntities = createThunk("deselectAllEntities", (_, api: GetShallowThunkAPI<AppThunkApiConfig<"getRouter">>) => {
	return { view: selectActiveView(api.extra.getRouter()) };
});
