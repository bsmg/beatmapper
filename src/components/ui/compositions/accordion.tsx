import type { Assign } from "@ark-ui/react";
import type { UseAccordionItemContext } from "@ark-ui/react/accordion";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { ChevronDownIcon, type LucideProps } from "lucide-react";
import { type ComponentProps, Fragment, type ReactNode } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import * as Builder from "$/components/ui/styled/accordion";

export interface AccordionProps<T extends CollectionItem> {
	children?: ComposableFn<[label: string, Indicator: typeof ItemIndicator]>;
	collection: ListCollection<T>;
	renderItem: (item: T, ctx: UseAccordionItemContext) => ReactNode;
}

function ItemIndicator({ ...rest }: LucideProps) {
	return (
		<Builder.ItemIndicator>
			<ChevronDownIcon {...rest} />
		</Builder.ItemIndicator>
	);
}

export function Accordion<T extends CollectionItem>({ children, collection, renderItem, ...rest }: Assign<ComponentProps<typeof Builder.Root>, AccordionProps<T>>) {
	const renderTrigger = useComposable(children, (label) => (
		<Fragment>
			{label}
			<ItemIndicator size={18} />
		</Fragment>
	));

	return (
		<Builder.Root {...rest}>
			<ForListCollection collection={collection}>
				{(item, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled}>
						<Builder.ItemTrigger>{renderTrigger(label ?? value, ItemIndicator)}</Builder.ItemTrigger>
						<Builder.ItemContent>
							<Builder.ItemContext>{(ctx) => renderItem(item, ctx)}</Builder.ItemContext>
						</Builder.ItemContent>
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
