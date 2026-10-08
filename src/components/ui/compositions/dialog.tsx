import type { Assign } from "@ark-ui/react";
import type { UseDialogContext } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import type { ComponentProps, PropsWithChildren, ReactNode, RefObject } from "react";

import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/dialog";
import { Stack } from "$:styled-system/jsx";

export interface DialogProps {
	title?: ReactNode;
	description?: ReactNode;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
	render: (ctx: UseDialogContext) => ReactNode;
}

function Overlay({ children, title, description, portalled = true, portalRef, render }: Assign<PropsWithChildren, DialogProps>) {
	return (
		<Portal disabled={!portalled} container={portalRef}>
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
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

export function Dialog({ children, title, description, portalled, portalRef, render, ...rest }: Assign<ComponentProps<typeof Builder.Root>, DialogProps>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	return (
		<Builder.Root modal={false} {...rest}>
			{children && <Trigger>{children}</Trigger>}
			<Overlay title={title} description={description} portalled={portalled} portalRef={portalRef} render={render}>
				<Builder.CloseTrigger>
					<XIcon />
				</Builder.CloseTrigger>
			</Overlay>
		</Builder.Root>
	);
}

export function DialogProvider({ children, title, description, portalled, portalRef, render, ...rest }: Assign<ComponentProps<typeof Builder.RootProvider>, DialogProps>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	return (
		<Builder.RootProvider {...rest}>
			{children && <Trigger>{children}</Trigger>}
			<Overlay title={title} description={description} portalled={portalled} portalRef={portalRef} render={render}>
				<Builder.CloseTrigger>
					<XIcon />
				</Builder.CloseTrigger>
			</Overlay>
		</Builder.RootProvider>
	);
}
