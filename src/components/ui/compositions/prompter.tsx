import { useDialog, useDialogContext } from "@ark-ui/react/dialog";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createContext, type FormEvent, type MouseEvent, type PropsWithChildren, type ReactNode, useCallback, useContext, useState } from "react";

import { HStack } from "$:styled-system/jsx";
import { Button } from "./button";
import { DialogProvider } from "./dialog";
import { useAppForm } from "./form";

// biome-ignore lint/suspicious/noExplicitAny: validators are inferred
type TFormApi<TValue> = ReturnType<typeof useAppForm<TValue, any, any, any, any, any, any, any, any, any, any, any>>;

export interface IPrompt<TValue, TProps> {
	title: string;
	defaultValues: (ctx: { props: TProps }) => TValue;
	validate?: StandardSchemaV1<TValue>;
	render: (ctx: { form: TFormApi<TValue> }) => ReactNode;
	onSubmit: (ctx: { value: TValue; props: TProps }) => void;
}
export function createPrompt<TValue, TProps>({ title, defaultValues, render, validate, onSubmit }: IPrompt<TValue, TProps>): IPrompt<TValue, TProps> {
	return { title, defaultValues, render, validate, onSubmit };
}

export interface IPrompter<TPrompts extends { [key in PropertyKey]: IPrompt<unknown, TProps> }, TProps> {
	prompts: TPrompts;
	openPrompt: (id: keyof TPrompts) => void;
}
export function createPrompterFactory<TProps>() {
	// biome-ignore lint/suspicious/noExplicitAny: value is inferred
	return <const TPrompts extends { [key in PropertyKey]: IPrompt<any, TProps> }>(builder: (ctx: { createPrompt: typeof createPrompt }) => TPrompts) => {
		const prompts = builder({ createPrompt });

		const Context = createContext<IPrompter<TPrompts, TProps> & { active: keyof TPrompts | null }>({ prompts, active: null, openPrompt: () => {} });

		function Provider({ children, ...props }: TProps & PropsWithChildren) {
			const [active, setActive] = useState<keyof TPrompts | null>(null);

			const dialog = useDialog({
				role: "alertdialog",
				trapFocus: false,
				modal: false,
			});

			const handleOpenPrompt = useCallback(
				(key: keyof TPrompts) => {
					setActive(key);
					dialog.setOpen(true);
				},
				[dialog],
			);

			return (
				<Context.Provider value={{ prompts, active, openPrompt: handleOpenPrompt }}>
					{children}
					<DialogProvider value={dialog} title={active ? prompts[active].title : undefined} lazyMount unmountOnExit onExitComplete={() => setActive(null)} render={() => (active ? <Contents active={active} {...props} /> : null)} />
				</Context.Provider>
			);
		}

		function Contents({ active, ...rest }: Omit<TProps, "children"> & { active: keyof TPrompts }) {
			const { prompts } = useContext(Context);

			const dialog = useDialogContext();

			const form = useAppForm({
				defaultValues: prompts[active].defaultValues({ props: rest as TProps }),
				validators: {
					onMount: prompts[active].validate,
					onChange: prompts[active].validate,
					onSubmit: prompts[active].validate,
				},
				onSubmit: ({ value }) => {
					return prompts[active].onSubmit({ value, props: rest as TProps });
				},
			});

			const handleSubmit = useCallback(
				(e: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					dialog.setOpen(false);
					form.handleSubmit();
				},
				[dialog, form],
			);

			const handleCancel = useCallback(
				(ev: MouseEvent<HTMLButtonElement>) => {
					ev.preventDefault();
					dialog.setOpen(false);
					form.reset();
				},
				[dialog, form],
			);

			return (
				<form.AppForm>
					<form onSubmit={handleSubmit}>
						<form.Root>
							{prompts[active].render({ form })}
							<HStack>
								<form.Submit variant="subtle" size="md" colorPalette="green" stretch onClick={handleSubmit}>
									Ok
								</form.Submit>
								<Button variant="subtle" size="md" colorPalette="red" stretch onClick={handleCancel}>
									Cancel
								</Button>
							</HStack>
						</form.Root>
					</form>
				</form.AppForm>
			);
		}

		return {
			Provider: Provider,
			Context: Context.Consumer,
			useContext: () => useContext(Context),
		};
	};
}
