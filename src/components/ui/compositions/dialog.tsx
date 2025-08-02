import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import { type ComponentProps, type PropsWithChildren, type ReactNode, useCallback } from "react";

import { HStack, Stack } from "$:styled-system/jsx";
import * as Builder from "../styled/dialog";
import { Button } from "./button";

export interface DialogProps {
	render: (ctx: UseDialogContext) => ReactNode;
	title?: ReactNode;
	description?: ReactNode;
}

function Contents({ title, description, render, children }: DialogProps & PropsWithChildren) {
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
					{children}
					<Builder.CloseTrigger>
						<XIcon />
					</Builder.CloseTrigger>
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

export function DialogProvider({ value, children, title, description, render, ...rest }: Assign<ComponentProps<typeof Builder.RootProvider>, DialogProps>) {
	return (
		<Builder.RootProvider {...rest} value={value}>
			{children && (
				<Builder.Trigger asChild>
					<span>{children}</span>
				</Builder.Trigger>
			)}
			<Contents {...value} title={title} description={description} render={render} />
		</Builder.RootProvider>
	);
}

export function AlertDialogProvider({ value, children, title, description, render, onSubmit, onCancel, ...rest }: ComponentProps<typeof DialogProvider> & { onSubmit?: () => void; onCancel?: () => void }) {
	const handleSubmit = useCallback(
		(ctx: UseDialogContext) => {
			ctx.setOpen(false);
			if (onSubmit) onSubmit();
		},
		[onSubmit],
	);

	const handleCancel = useCallback(
		(ctx: UseDialogContext) => {
			ctx.setOpen(false);
			if (onCancel) onCancel();
		},
		[onCancel],
	);

	return (
		<Builder.RootProvider {...rest} value={value}>
			{children && (
				<Builder.Trigger asChild>
					<span>{children}</span>
				</Builder.Trigger>
			)}
			<Contents {...value} title={title} description={description} render={render}>
				<Builder.Context>
					{(ctx) => (
						<HStack>
							<Button autoFocus variant="subtle" size="md" colorPalette="green" stretch onClick={() => handleSubmit(ctx)}>
								Ok
							</Button>
							<Button variant="subtle" size="md" colorPalette="red" stretch onClick={() => handleCancel(ctx)}>
								Cancel
							</Button>
						</HStack>
					)}
				</Builder.Context>
			</Contents>
		</Builder.RootProvider>
	);
}
