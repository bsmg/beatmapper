import type { UseCollapsibleContext } from "@ark-ui/react/collapsible";
import type { ComponentProps, ReactNode } from "react";

import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/collapsible";

interface Props extends ComponentProps<typeof Builder.Root> {
	render: (ctx: UseCollapsibleContext) => ReactNode;
}
export function Collapsible({ children, render, ...rest }: Props) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	return (
		<Builder.Root {...rest}>
			<Trigger>{children}</Trigger>
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
