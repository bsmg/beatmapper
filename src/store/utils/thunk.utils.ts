import type { ActionCreatorWithPayload, Dispatch, GetState, SerializedError, ThunkAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

import { cycle } from "$/utils";

type IsAny<T, True, False = never> = true | false extends (T extends never ? true : false) ? True : False;
type IsUnknown<T, True, False = never> = unknown extends T ? IsAny<T, False, True> : False;
type FallbackIfUnknown<T, Fallback> = IsUnknown<T, Fallback, T>;

type GetDispatch<ThunkApiConfig> = ThunkApiConfig extends { dispatch: infer Dispatch } ? FallbackIfUnknown<Dispatch, ThunkDispatch<GetState<ThunkApiConfig>, GetExtra<ThunkApiConfig>, UnknownAction>> : ThunkDispatch<GetState<ThunkApiConfig>, GetExtra<ThunkApiConfig>, UnknownAction>;
type GetExtra<ThunkApiConfig> = ThunkApiConfig extends { extra: infer Extra } ? Extra : unknown;
type GetMeta<ThunkApiConfig> = ThunkApiConfig extends { meta: infer Meta } ? Meta : unknown;
type GetSerializedErrorType<ThunkApiConfig> = ThunkApiConfig extends { serializedErrorType: infer TError } ? TError : SerializedError;

type GetArgs<Arg> = [undefined] extends [Arg] ? [_?: Arg] : [arg: Arg];

export interface GetShallowThunkAPI<ThunkApiConfig> {
	dispatch: GetDispatch<ThunkApiConfig>;
	getState: () => GetState<ThunkApiConfig>;
	extra: GetExtra<ThunkApiConfig>;
}

export interface ThunkActionCreator<Arg, ThunkApiConfig, Returned = void> extends ActionCreatorWithPayload<Returned> {
	(...args: GetArgs<Arg>): ThunkAction<Returned, GetState<ThunkApiConfig>, GetExtra<ThunkApiConfig>, UnknownAction>;
}

export interface ThunkOptions<Arg, ThunkApiConfig> {
	condition?: (arg: Arg, api: Pick<GetShallowThunkAPI<ThunkApiConfig>, "getState" | "extra">) => boolean | undefined;
	getMeta?: (arg: Arg, api: Pick<GetShallowThunkAPI<ThunkApiConfig>, "getState" | "extra">) => GetMeta<ThunkApiConfig>;
	serializeError?: (x: unknown) => GetSerializedErrorType<ThunkApiConfig>;
}

export function createThunk<Arg, ThunkApiConfig, Returned>(type: string, payloadCreator: (arg: Arg, api: GetShallowThunkAPI<ThunkApiConfig>) => Returned, options?: ThunkOptions<Arg, ThunkApiConfig>): ThunkActionCreator<Arg, ThunkApiConfig, Returned> {
	const actionCreator = (...args: GetArgs<Arg>) => {
		const arg = args[0] as Arg;

		return (dispatch: GetDispatch<ThunkApiConfig>, getState: () => GetState<ThunkApiConfig>, extra: GetExtra<ThunkApiConfig>) => {
			const api: GetShallowThunkAPI<ThunkApiConfig> = { dispatch, getState, extra };

			if (options?.condition && !options.condition(arg, api)) {
				return;
			}

			const meta = options?.getMeta?.(arg, api);

			try {
				const payload = payloadCreator(arg, api);
				dispatch({ type, payload, meta });
				return { type, meta, payload };
			} catch (error) {
				const serializedError = options?.serializeError?.(error) ?? error;
				dispatch({ type, error: serializedError, meta });
				return { type, meta, error: serializedError };
			}
		};
	};

	return Object.assign(actionCreator, {
		type: type,
		toString: () => type,
		match: (action: UnknownAction): action is ReturnType<ActionCreatorWithPayload<Returned>> => {
			return action?.type === type;
		},
	}) as ThunkActionCreator<Arg, ThunkApiConfig, Returned>;
}

export function createIncrementByIndexPayloadActionCreator<TState, TValue>(iterable: Iterable<TValue>, options: { select: (state: TState) => TValue; update: (value: TValue) => UnknownAction }) {
	const values = Object.values(iterable);

	return (args: { delta: number }, api: { getState: () => TState; dispatch: Dispatch }) => {
		const value = options.select(api.getState());
		api.dispatch(options.update(cycle(values, value, args.delta, "stop")));
	};
}
export function createIncrementByValuePayloadActionCreator<TState>([min, max]: [number, number], options: { select: (state: TState) => number; update: (value: number) => UnknownAction }) {
	return (args: { delta: number }, api: { getState: () => TState; dispatch: Dispatch }) => {
		const value = options.select(api.getState());
		const isIncrement = args.delta > 0;
		api.dispatch(options.update((isIncrement ? Math.min : Math.max)(value + args.delta, isIncrement ? max : min)));
	};
}
