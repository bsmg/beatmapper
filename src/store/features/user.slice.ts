import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { addSong, addSongFromFile, finishLoadingMap, hydrateUser, updateSong } from "$/store/actions";
import { ObstaclePlacementMode } from "$/types";

const initialState = {
	isNewUser: true,
	seenPrompts: [] as string[],
	stickyMapAuthorName: "",
	processingDelay: 60,
	renderScale: 1,
	isBloomEnabled: true,
	obstaclePlacementMode: ObstaclePlacementMode.LEGACY as ObstaclePlacementMode,
	pacerWaitMs: 50,
};

const slice = createSlice({
	name: "user",
	initialState: initialState,
	selectors: {
		selectNew: (state) => state.isNewUser,
		selectAnnouncements: (state) => state.seenPrompts,
		selectUsername: (state) => state.stickyMapAuthorName,
		selectProcessingDelay: (state) => (typeof state.processingDelay === "number" ? state.processingDelay : initialState.processingDelay),
		selectRenderScale: (state) => state.renderScale,
		selectBloomEnabled: (state) => state.isBloomEnabled,
		selectObstaclePlacementMode: (state) => state.obstaclePlacementMode,
		selectPacerWait: (state) => state.pacerWaitMs,
	},
	reducers: (api) => {
		return {
			dismissPrompt: api.reducer<{ id: string }>((state, action) => {
				const { id } = action.payload;
				return { ...state, seenPrompts: [...state.seenPrompts, id] };
			}),
			updateUsername: api.reducer<{ value: string }>((state, action) => {
				const { value } = action.payload;
				return { ...state, stickyMapAuthorName: value };
			}),
			updateProcessingDelay: api.reducer<{ value: number }>((state, action) => {
				const { value } = action.payload;
				return { ...state, processingDelay: value };
			}),
			updateRenderScale: api.reducer<{ value: number }>((state, action) => {
				const { value } = action.payload;
				return { ...state, renderScale: value };
			}),
			updateBloomEnabled: api.reducer<{ checked?: boolean } | undefined>((state, action) => {
				const { checked } = action.payload ?? {};
				if (checked) return { ...state, isBloomEnabled: checked };
				return { ...state, isBloomEnabled: !state.isBloomEnabled };
			}),
			updateObstaclePlacementMode: api.reducer<{ value: ObstaclePlacementMode }>((state, action) => {
				const { value } = action.payload;
				return { ...state, obstaclePlacementMode: value };
			}),
			updatePacerWait: api.reducer<{ value: number }>((state, action) => {
				const { value } = action.payload;
				return { ...state, pacerWaitMs: value };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addCase(hydrateUser, (state, action) => {
			const { "user.new": isNewUser, "user.announcements": seenPrompts, "user.username": stickyMapAuthorName, "audio.offset": processingDelay, "graphics.scale": renderScale, "graphics.bloom": isBlooming, "controls.obstacles": obstaclePlacementMode } = action.payload;
			if (isNewUser !== undefined) state.isNewUser = isNewUser;
			if (seenPrompts !== undefined) state.seenPrompts = seenPrompts;
			if (stickyMapAuthorName !== undefined) state.stickyMapAuthorName = stickyMapAuthorName;
			if (processingDelay !== undefined) state.processingDelay = processingDelay;
			if (renderScale !== undefined) state.renderScale = renderScale;
			if (isBlooming !== undefined) state.isBloomEnabled = isBlooming;
			if (obstaclePlacementMode !== undefined) state.obstaclePlacementMode = Object.values(ObstaclePlacementMode)[obstaclePlacementMode];
		});
		builder.addCase(addSongFromFile.fulfilled, (state) => {
			return { ...state, isNewUser: false };
		});
		builder.addCase(updateSong, (state, action) => {
			const { changes: songData } = action.payload;
			if (!songData.mapAuthorName) return state;
			return { ...state, stickyMapAuthorName: songData.mapAuthorName };
		});
		builder.addMatcher(isAnyOf(addSong, finishLoadingMap), (state) => {
			return { ...state, isNewUser: false };
		});
		builder.addDefaultCase((state) => state);
	},
});

export default slice;
