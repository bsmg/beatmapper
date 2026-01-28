import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/radio-group";

export interface RadioGroupProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function RadioGroup<T extends CollectionItem>({ collection, children, ...rest }: RadioGroupProps<T>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<ForListCollection collection={collection}>
				{(_, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled}>
						<Builder.ItemControl />
						<Builder.ItemText>{label ?? value}</Builder.ItemText>
						<Builder.ItemHiddenInput />
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
