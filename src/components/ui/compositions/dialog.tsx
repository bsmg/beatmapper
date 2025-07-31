import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Stack } from "$:styled-system/jsx";
import * as Builder from "../styled/dialog";

export interface DialogProps {
	render: (ctx: UseDialogContext) => ReactNode;
	title?: ReactNode;
	description?: ReactNode;
}

function Contents({ title, description, render }: DialogProps) {
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
