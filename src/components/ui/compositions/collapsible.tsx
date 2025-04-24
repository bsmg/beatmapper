import type { UseCollapsibleContext } from "@ark-ui/react/collapsible";
import type { ComponentProps, ReactNode } from "react";

import * as Builder from "../styled/collapsible";

interface Props extends ComponentProps<typeof Builder.Root> {
	render: (ctx: UseCollapsibleContext) => ReactNode;
}
export function Collapsible({ children, render, ...rest }: Props) {
	return (
		<Builder.Root {...rest}>
			<Builder.Trigger asChild>{children}</Builder.Trigger>
			<Builder.Content>
				<Builder.Context>{(ctx) => render(ctx)}</Builder.Context>
			</Builder.Content>
		</Builder.Root>
	);
}
