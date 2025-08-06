import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/menu";

export interface MenuItem extends CollectionItem {}

export interface MenuProps<T extends MenuItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function Menu<T extends MenuItem>({ collection, children, ...rest }: MenuProps<T>) {
	return (
		<Builder.Root {...rest}>
			<Builder.Trigger asChild>
				<span>{children}</span>
			</Builder.Trigger>
			<Builder.Positioner>
				<Builder.Content>
					<ListCollectionFor collection={collection}>
						{(item) => {
							const value = collection.getItemValue(item);
							if (!value || collection.getItemDisabled(item)) return;
							const label = collection.stringifyItem(item);
							return (
								<Builder.Item key={value} value={value}>
									{label}
								</Builder.Item>
							);
						}}
					</ListCollectionFor>
				</Builder.Content>
			</Builder.Positioner>
		</Builder.Root>
	);
}
