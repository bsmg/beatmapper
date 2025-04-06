import type { UseDialogContext } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Stack } from "$:styled-system/jsx";
import * as Builder from "../styled/dialog";

export interface DialogProps extends ComponentProps<typeof Builder.Root> {
	title: ReactNode;
	description?: ReactNode;
	render: (ctx: UseDialogContext) => ReactNode;
}
export function Dialog({ title, description, render, children, ...rest }: DialogProps) {
	return (
		<Builder.Root {...rest}>
			{children && (
				<Builder.Trigger asChild>
					<span>{children}</span>
				</Builder.Trigger>
			)}
			<Portal>
				<Builder.Backdrop />
				<Builder.Positioner>
					<Builder.Content data-placement="top">
						<Stack>
							<Builder.Title>{title}</Builder.Title>
							{description && <Builder.Description>{description}</Builder.Description>}
						</Stack>
						<Builder.Context>{(ctx) => render(ctx)}</Builder.Context>
						<Builder.CloseTrigger>
							<XIcon />
						</Builder.CloseTrigger>
					</Builder.Content>
				</Builder.Positioner>
			</Portal>
		</Builder.Root>
	);
}
