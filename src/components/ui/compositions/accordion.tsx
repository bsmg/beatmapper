import type { UseAccordionItemContext } from "@ark-ui/react/accordion";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/accordion";

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
				{(item) => (
					<Builder.Item key={item.value} value={item.value} disabled={item.disabled}>
						<Builder.ItemTrigger>
							{item.label}
							<Builder.ItemIndicator>
								<ChevronDownIcon size={18} />
							</Builder.ItemIndicator>
						</Builder.ItemTrigger>
						<Builder.ItemContent>
							<Builder.ItemContext>{(ctx) => item.render(ctx)}</Builder.ItemContext>
						</Builder.ItemContent>
					</Builder.Item>
				)}
			</ListCollectionFor>
		</Builder.Root>
	);
}
