import { useDialog, useDialogContext } from "@ark-ui/react/dialog";
import { type FormEvent, type MouseEvent, type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { HStack } from "$:styled-system/jsx";
import { Button } from "./button";
import { DialogProvider } from "./dialog";
import { useAppForm } from "./form";
import { type IPrompt, PrompterContext } from "./prompter.context";

export function Prompter({ children }: PropsWithChildren) {
	const [active, setActive] = useState<(IPrompt & { id: string }) | null>(null);
	const [registry] = useState(() => new Map<string, IPrompt & { id: string }>());

	const dialog = useDialog({ role: "dialog", modal: false });

	const register = useCallback(
		(state: IPrompt & { id: string }) => {
			registry.set(state.id, state);
		},
		[registry],
	);

	const unregister = useCallback(
		(id: string) => {
			registry.delete(id);
		},
		[registry],
	);

	const open = useCallback(
		(id: string) => {
			const entry = registry.get(id);

			if (entry) {
				setActive(entry);
				dialog.setOpen(true);
			}
		},
		[registry, dialog],
	);

	const contextValue = useMemo(() => {
		return { register, unregister, open, active };
	}, [register, unregister, open, active]);

	return (
		<PrompterContext.Provider value={contextValue}>
			{children}
			<DialogProvider value={dialog} title={active?.title} description={active?.description} lazyMount unmountOnExit onExitComplete={() => setActive(null)} render={() => (active ? <Contents {...active} /> : null)} />
		</PrompterContext.Provider>
	);
}

function Contents({ validate, defaultValues, render, onSubmit }: IPrompt) {
	const dialog = useDialogContext();

	const form = useAppForm({
		defaultValues: defaultValues,
		validators: { onMount: validate, onChange: validate, onSubmit: validate },
		onSubmit: onSubmit,
	});

	const handleSubmit = useCallback(
		(e: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			form.handleSubmit().then(() => {
				if (Object.keys(form.state.errors).length === 0) {
					dialog.setOpen(false);
				}
			});
		},
		[dialog, form],
	);

	const handleCancel = useCallback(
		(ev: MouseEvent<HTMLButtonElement>) => {
			ev.preventDefault();
			form.reset();
			dialog.setOpen(false);
		},
		[dialog, form],
	);

	return (
		<form.AppForm>
			<form onSubmit={handleSubmit}>
				<form.Root>
					{render({ form })}
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
