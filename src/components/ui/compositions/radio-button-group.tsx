import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps, CSSProperties } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/radio-button-group";

function getItemStyles(item: CollectionItem): CSSProperties {
	return { "--current-color": typeof item === "object" && !!item && "color" in item ? item.color : undefined };
}

export interface RadioButtonGroupProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function RadioButtonGroup<T extends CollectionItem>({ collection, children, ...rest }: RadioButtonGroupProps<T>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.Indicator />
			<ForListCollection collection={collection}>
				{(item, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled} data-disabled={disabled} style={getItemStyles(item)}>
						<Builder.ItemText>{label}</Builder.ItemText>
						<Builder.ItemHiddenInput />
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
