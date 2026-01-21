import type { UseAccordionItemContext } from "@ark-ui/react/accordion";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/accordion";

export interface AccordionProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
	renderItem: (item: T, ctx: UseAccordionItemContext) => ReactNode;
}
export function Accordion<T extends CollectionItem>({ collection, renderItem, ...rest }: AccordionProps<T>) {
	return (
		<Builder.Root {...rest}>
			<ForListCollection collection={collection}>
				{(item, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled}>
						<Builder.ItemTrigger>
							{label}
							<Builder.ItemIndicator>
								<ChevronDownIcon size={18} />
							</Builder.ItemIndicator>
						</Builder.ItemTrigger>
						<Builder.ItemContent>
							<Builder.ItemContext>{(ctx) => renderItem(item, ctx)}</Builder.ItemContext>
						</Builder.ItemContent>
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
