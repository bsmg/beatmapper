import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createContext, type ReactNode, useContext, useEffect, useId } from "react";

import type { useAppForm } from "./form";

// biome-ignore lint/suspicious/noExplicitAny: any validators are acceptable
type AppFormApi<TFormData> = ReturnType<typeof useAppForm<TFormData, any, any, any, any, any, any, any, any, any, any, any>>;

interface IPromptDetails<TInput, TOutput> {
	title: string;
	description?: string;
	validate?: StandardSchemaV1<TInput, TOutput>;
	defaultValues?: TInput;
}
interface IPromptHandlers<TInput, TOutput> {
	render: (ctx: { form: AppFormApi<TInput> }) => ReactNode;
	onSubmit: (ctx: { value: TOutput }) => void;
}

export interface IPrompt<TInput = unknown, TOutput = TInput> extends IPromptDetails<TInput, TOutput>, IPromptHandlers<TInput, TOutput> {}

export function createPromptFactory<TInput = unknown, TOutput = TInput>(details: IPromptDetails<TInput, TOutput>) {
	return (handlers: IPromptHandlers<TInput, TOutput>): IPrompt<TInput, TOutput> => {
		return { ...details, ...handlers };
	};
}

interface PrompterContextValue<TInput = unknown, TOutput = TInput> {
	register: (data: IPrompt<TInput, TOutput> & { id: string }) => void;
	unregister: (id: string) => void;
	open: (id: string) => void;
	active: (IPrompt<TInput, TOutput> & { id: string }) | null;
}

export const PrompterContext = createContext<PrompterContextValue>({ register: () => {}, unregister: () => {}, open: () => {}, active: null });

export function usePrompter() {
	const { active } = useContext(PrompterContext);

	return { isPromptActive: !!active };
}

export function usePrompt<TInput, TOutput>(data: IPrompt<TInput, TOutput>) {
	const ctx = useContext(PrompterContext);

	if (!ctx) throw new Error("usePrompt must be used within PrompterProvider");

	const id = useId();

	useEffect(() => {
		ctx.register({ ...(data as IPrompt<unknown, unknown>), id });
		return () => ctx.unregister(id);
	}, [data, ctx, id]);

	return {
		trigger: () => ctx.open(id),
		isOpen: ctx.active?.id === id,
	};
}
