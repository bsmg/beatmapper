import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

import type { getRouter } from "$/router";
import type { default as reducer } from "./features/_setup";

export interface AppExtraArgs {
	getRouter: typeof getRouter;
}

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = ThunkDispatch<RootState, AppExtraArgs, UnknownAction>;

export interface AppThunkApiConfig {
	state: RootState;
	dispatch: AppDispatch;
	extra: AppExtraArgs;
}
