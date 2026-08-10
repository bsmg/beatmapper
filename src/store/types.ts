import type { CreateToasterReturn } from "@ark-ui/react/toast";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import type { Register } from "@tanstack/react-router";

import type { BeatmapFilestore } from "$/services/file.service";
import type { default as reducer } from "./features/_setup";

export interface AppExtraArgs {
	getRouter: () => Register["router"];
	getFilestore: () => BeatmapFilestore;
	getToaster: () => CreateToasterReturn | null;
	getAudioContext: () => AudioContext;
}

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = ThunkDispatch<RootState, AppExtraArgs, UnknownAction>;

export interface AppThunkApiConfig<E extends keyof AppExtraArgs = never> {
	state: RootState;
	dispatch: AppDispatch;
	extra: Pick<AppExtraArgs, E>;
}
