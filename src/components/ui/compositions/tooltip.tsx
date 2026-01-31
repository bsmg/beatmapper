import { Portal } from "@ark-ui/react/portal";
import type { UseTooltipContext } from "@ark-ui/react/tooltip";
import type { ComponentProps, ReactNode } from "react";

import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/tooltip";

interface Props extends ComponentProps<typeof Builder.Root> {
	showArrow?: boolean;
	portalled?: boolean;
	portalRef?: React.RefObject<HTMLElement>;
	render: (ctx: UseTooltipContext) => ReactNode;
	disabled?: boolean;
}
export function Tooltip({ showArrow = true, portalled = true, portalRef, children, render, disabled, ...rest }: Props) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	if (disabled) return children;

	return (
		<Builder.Root {...rest}>
			<Trigger>{children}</Trigger>
			<Portal disabled={!portalled} container={portalRef}>
				<Builder.Positioner>
					<Builder.Content>
						{showArrow && (
							<Builder.Arrow>
								<Builder.ArrowTip />
							</Builder.Arrow>
						)}
						<Builder.Context>{(ctx) => render(ctx)}</Builder.Context>
					</Builder.Content>
				</Builder.Positioner>
			</Portal>
		</Builder.Root>
	);
}
