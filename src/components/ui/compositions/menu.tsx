import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/menu";

export interface MenuProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function Menu<T extends CollectionItem>({ collection, children, ...rest }: MenuProps<T>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));

	return (
		<Builder.Root {...rest}>
			<Trigger>{children}</Trigger>
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
