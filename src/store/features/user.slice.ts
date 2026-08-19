import { createSelector, createSlice } from "@reduxjs/toolkit";

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
			updateNew: api.reducer<boolean>((state, action) => {
				return { ...state, isNewUser: action.payload };
			}),
			updateAnnouncements: api.reducer<string[]>((state, action) => {
				return { ...state, seenPrompts: action.payload };
			}),
			updateUsername: api.reducer<string>((state, action) => {
				return { ...state, stickyMapAuthorName: action.payload };
			}),
			updateRenderScale: api.reducer<number>((state, action) => {
				return { ...state, renderScale: action.payload };
			}),
			updateBloomEnabled: api.reducer<boolean | undefined>((state, action) => {
				return { ...state, isBloomEnabled: action.payload ?? !state.isBloomEnabled };
			}),
			updateObstaclePlacementMode: api.reducer<ObstaclePlacementMode>((state, action) => {
				return { ...state, obstaclePlacementMode: action.payload };
			}),
			updatePacerWait: api.reducer<number>((state, action) => {
				return { ...state, pacerWaitMs: action.payload };
			}),
		};
	},
	extraReducers: (builder) => {
		builder.addDefaultCase((state) => state);
	},
});

export const { selectNew, selectAnnouncements, selectUsername, selectRenderScale, selectBloomEnabled, selectObstaclePlacementMode: selectUserObstaclePlacementMode, selectPacerWait } = slice.getSelectors(slice.selectSlice);

export const selectSurfaceDepth = createSelector(selectRenderScale, (renderScale) => {
	return Math.max(renderScale * 75, 25);
});

export const { updateNew, updateAnnouncements, updateUsername, updateRenderScale, updateBloomEnabled, updateObstaclePlacementMode, updatePacerWait } = slice.actions;

export default slice;
