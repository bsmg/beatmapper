import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import { type ComponentProps, type Dispatch, type ReactNode, type SetStateAction, useCallback, useState } from "react";

import { HStack, Stack } from "$:styled-system/jsx";
import * as Builder from "../styled/dialog";
import { Button } from "./button";

export interface DialogProps extends Builder.BaseProps {
	render: (ctx: UseDialogContext) => ReactNode;
	title?: ReactNode;
	description?: ReactNode;
	onActionClick?: (confirmed: boolean) => void;
}

function Contents({ title, description, render, onActionClick }: DialogProps) {
	const handleActionClick = useCallback(
		(ctx: UseDialogContext, confirmed: boolean) => {
			ctx.setOpen(false);
			if (!onActionClick) return;
			if (confirmed) return onActionClick(true);
			return onActionClick(false);
		},
		[onActionClick],
	);

	return (
		<Portal>
			<Builder.Backdrop />
			<Builder.Positioner>
				<Builder.Content data-placement="top">
					{(title || description) && (
						<Stack>
							{title && <Builder.Title>{title}</Builder.Title>}
							{description && <Builder.Description>{description}</Builder.Description>}
						</Stack>
					)}
					<Builder.Context>{(ctx) => render(ctx)}</Builder.Context>
					{onActionClick && (
						<Builder.Context>
							{(ctx) => (
								<HStack>
									<Button variant="subtle" size="md" colorPalette="green" stretch onClick={() => handleActionClick(ctx, true)}>
										Ok
									</Button>
									<Button variant="subtle" size="md" colorPalette="red" stretch onClick={() => handleActionClick(ctx, false)}>
										Cancel
									</Button>
								</HStack>
							)}
						</Builder.Context>
					)}
					{!onActionClick && (
						<Builder.CloseTrigger>
							<XIcon />
						</Builder.CloseTrigger>
					)}
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

export function Dialog({ children, ...rest }: Assign<ComponentProps<typeof Builder.Root>, DialogProps>) {
	return (
		<Builder.Root {...rest}>
			{children && (
				<Builder.Trigger asChild>
					<span>{children}</span>
				</Builder.Trigger>
			)}
			<Contents {...rest} />
		</Builder.Root>
	);
}

export function DialogProvider({ value, children, ...rest }: Assign<ComponentProps<typeof Builder.RootProvider>, DialogProps>) {
	return (
		<Builder.RootProvider value={value}>
			{children && (
				<Builder.Trigger asChild>
					<span>{children}</span>
				</Builder.Trigger>
			)}
			<Contents {...rest} />
		</Builder.RootProvider>
	);
}

interface PromptDialogProviderProps {
	placeholder?: string;
	onSubmit: (input: string) => void;
	render: (ctx: { state: string; setState: Dispatch<SetStateAction<string>>; placeholder?: string }) => ReactNode;
}
export function PromptDialogProvider({ value, placeholder, onSubmit, render, ...rest }: Assign<ComponentProps<typeof Builder.RootProvider>, Omit<DialogProps, "render"> & PromptDialogProviderProps>) {
	const [state, setState] = useState("");

	const handleSubmit = useCallback(
		(confirmed: boolean) => {
			if (!confirmed) return;
			if (onSubmit) onSubmit(state);
			setState("");
		},
		[state, onSubmit],
	);

	return <DialogProvider value={value} {...rest} lazyMount unmountOnExit render={() => render({ state, placeholder, setState })} onActionClick={handleSubmit} />;
}
