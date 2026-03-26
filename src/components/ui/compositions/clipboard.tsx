import type { Assign } from "@ark-ui/react";
import { CheckIcon, CopyIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/clipboard";

function Indicator({ ...rest }: LucideProps) {
	return (
		<Builder.Indicator copied={<CheckIcon {...rest} />}>
			<CopyIcon {...rest} />
		</Builder.Indicator>
	);
}

export interface ClipboardProps {
	label?: string;
}

export function Clipboard({ label, children, ...rest }: Assign<ComponentProps<typeof Builder.Root>, ClipboardProps & { children: ComposableFn<[Indicator: ComponentType<LucideProps>]> }>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));
	const renderTrigger = useComposable(children, (Indicator) => <Indicator size={16} />);

	return (
		<Builder.Root {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			{children && <Trigger>{renderTrigger(Indicator)}</Trigger>}
		</Builder.Root>
	);
}
