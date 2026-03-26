import type { Assign } from "@ark-ui/react";
import type { UseCollapsibleContext } from "@ark-ui/react/collapsible";
import { ChevronRightIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Show } from "$/components/ui/atoms";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/collapsible";

export interface CollapsibleProps {
	children?: ComposableFn<[Indicator: typeof Indicator]>;
	render: (ctx: UseCollapsibleContext) => ReactNode;
}

function Indicator({ ...rest }: LucideProps) {
	return (
		<Builder.Indicator>
			<ChevronRightIcon {...rest} />
		</Builder.Indicator>
	);
}

export function Collapsible({ children, render, ...rest }: Assign<ComponentProps<typeof Builder.Root>, CollapsibleProps>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));
	const renderTrigger = useComposable(children, (Indicator) => <Indicator size={18} />);

	return (
		<Builder.Root {...rest}>
			{children && <Trigger>{renderTrigger(Indicator)}</Trigger>}
			<Builder.Context>{(ctx) => <Show when={render(ctx)}>{(content) => <Builder.Content>{content}</Builder.Content>}</Show>}</Builder.Context>
		</Builder.Root>
	);
}
