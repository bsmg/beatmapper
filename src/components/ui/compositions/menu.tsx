import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/menu";

export interface MenuProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function Menu<T extends CollectionItem>({ collection, children, ...rest }: MenuProps<T>) {
	return (
		<Builder.Root {...rest}>
			<Builder.Trigger asChild>
				<span>{children}</span>
			</Builder.Trigger>
			<Builder.Positioner>
				<Builder.Content>
					<ForListCollection collection={collection}>
						{(_, { value, label }) => (
							<Builder.Item key={value} value={value}>
								{label}
							</Builder.Item>
						)}
					</ForListCollection>
				</Builder.Content>
			</Builder.Positioner>
		</Builder.Root>
	);
}
