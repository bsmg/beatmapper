import type { UseAccordionItemContext } from "@ark-ui/react/accordion";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/accordion";

export interface AccordionItem extends CollectionItem {
	value: string;
	render: (ctx: UseAccordionItemContext) => ReactNode;
}

export interface AccordionProps<T extends AccordionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function Accordion<T extends AccordionItem>({ collection, ...rest }: AccordionProps<T>) {
	return (
		<Builder.Root {...rest}>
			<ListCollectionFor collection={collection}>
				{(item) => {
					const value = collection.getItemValue(item);
					if (!value) return null;
					const label = collection.stringifyItem(item);
					const disabled = collection.getItemDisabled(item);
					return (
						<Builder.Item key={value} value={value} disabled={disabled}>
							<Builder.ItemTrigger>
								{label}
								<Builder.ItemIndicator>
									<ChevronDownIcon size={18} />
								</Builder.ItemIndicator>
							</Builder.ItemTrigger>
							<Builder.ItemContent>
								<Builder.ItemContext>{(ctx) => item.render(ctx)}</Builder.ItemContext>
							</Builder.ItemContent>
						</Builder.Item>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
