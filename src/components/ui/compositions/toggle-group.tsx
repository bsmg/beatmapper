import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/toggle-group";

export interface ToggleItem extends CollectionItem {}

export interface ToggleGroupProps<T extends ToggleItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function ToggleGroup<T extends ToggleItem>({ collection, ...rest }: ToggleGroupProps<T>) {
	return (
		<Builder.Root {...rest}>
			<ListCollectionFor collection={collection}>
				{(item) => (
					<Builder.Item key={item.value} value={item.value} disabled={item.disabled}>
						{item.label}
					</Builder.Item>
				)}
			</ListCollectionFor>
		</Builder.Root>
	);
}
