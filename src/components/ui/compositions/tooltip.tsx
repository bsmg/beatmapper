import type { Assign } from "@ark-ui/react";
import { Portal } from "@ark-ui/react/portal";
import type { UseTooltipContext } from "@ark-ui/react/tooltip";
import type { ComponentProps, ReactNode, RefObject } from "react";

import { Show } from "$/components/ui/atoms";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/tooltip";

export interface TooltipProps {
	disabled?: boolean;
	showArrow?: boolean;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
	render: (ctx: UseTooltipContext) => ReactNode;
}

function Overlay({ showArrow, portalled = true, portalRef, render }: TooltipProps) {
	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Positioner>
				<Builder.Content>
					<Show when={showArrow}>
						<Builder.Arrow>
							<Builder.ArrowTip />
						</Builder.Arrow>
					</Show>
					<Builder.Context>{(ctx) => render(ctx)}</Builder.Context>
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

export function Tooltip({ children, disabled, showArrow, portalled, portalRef, render, ...rest }: Assign<ComponentProps<typeof Builder.Root>, TooltipProps>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	if (disabled) return children;

	return (
		<Builder.Root {...rest}>
			{children && <Trigger>{children}</Trigger>}
			<Overlay showArrow={showArrow} portalled={portalled} portalRef={portalRef} render={render} />
		</Builder.Root>
	);
}
