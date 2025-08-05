import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/toggle-group";

export interface ToggleItem extends CollectionItem {}

export interface ToggleGroupProps<T extends ToggleItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function ToggleGroup<T extends ToggleItem>({ collection, ...rest }: ToggleGroupProps<T>) {
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
							{label}
						</Builder.Item>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
