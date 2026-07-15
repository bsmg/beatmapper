import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { addSong, addSongFromFile, finishLoadingMap, updateSong } from "$/store/actions";
import { ObstaclePlacementMode } from "$/types";

const initialState = {
	isNewUser: true,
	seenPrompts: [] as string[],
	stickyMapAuthorName: "",
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
		selectRenderScale: (state) => state.renderScale,
		selectBloomEnabled: (state) => state.isBloomEnabled,
		selectObstaclePlacementMode: (state) => state.obstaclePlacementMode,
		selectPacerWait: (state) => state.pacerWaitMs,
	},
	reducers: (api) => {
		return {
			updateNew: api.reducer<{ value: boolean }>((state, action) => {
				const { value } = action.payload;
				return { ...state, isNewUser: value };
			}),
			updateAnnouncements: api.reducer<{ value: string[] }>((state, action) => {
				const { value } = action.payload;
				return { ...state, seenPrompts: value };
			}),
			dismissPrompt: api.reducer<{ id: string }>((state, action) => {
				const { id } = action.payload;
				return { ...state, seenPrompts: [...state.seenPrompts, id] };
			}),
			updateUsername: api.reducer<{ value: string }>((state, action) => {
				const { value } = action.payload;
				return { ...state, stickyMapAuthorName: value };
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
