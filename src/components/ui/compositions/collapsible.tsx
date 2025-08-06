import type { UseCollapsibleContext } from "@ark-ui/react/collapsible";
import type { ComponentProps, ReactNode } from "react";

import * as Builder from "$/components/ui/styled/collapsible";

interface Props extends ComponentProps<typeof Builder.Root> {
	render: (ctx: UseCollapsibleContext) => ReactNode;
}
export function Collapsible({ children, render, ...rest }: Props) {
	return (
		<Builder.Root {...rest}>
			<Builder.Trigger asChild>{children}</Builder.Trigger>
			<Builder.Context>
				{(ctx) => {
					const content = render(ctx);
					if (!content) return null;
					return <Builder.Content>{content}</Builder.Content>;
				}}
			</Builder.Context>
		</Builder.Root>
	);
}
