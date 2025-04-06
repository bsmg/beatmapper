import { Portal } from "@ark-ui/react/portal";
import type { UseTooltipContext } from "@ark-ui/react/tooltip";
import type { ComponentProps, ReactNode } from "react";

import * as Builder from "../styled/tooltip";

interface Props extends ComponentProps<typeof Builder.Root> {
	showArrow?: boolean;
	portalled?: boolean;
	portalRef?: React.RefObject<HTMLElement>;
	render: (ctx: UseTooltipContext) => ReactNode;
	disabled?: boolean;
}
export function Tooltip({ showArrow = true, portalled, portalRef, children, render, disabled, ...rest }: Props) {
	if (disabled) return children;
	return (
		<Builder.Root {...rest}>
			<Builder.Trigger asChild>
				<span>{children}</span>
			</Builder.Trigger>
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
