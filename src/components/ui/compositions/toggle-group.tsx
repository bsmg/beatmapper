import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { type ComponentProps, type MouseEventHandler, useCallback } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/toggle-group";

export interface ToggleItem extends CollectionItem {}

export interface ToggleGroupProps<T extends ToggleItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
	unfocusOnClick?: boolean;
}
export function ToggleGroup<T extends ToggleItem>({ collection, unfocusOnClick, ...rest }: ToggleGroupProps<T>) {
	const handleClickCapture = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(event) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root {...rest} tabIndex={-1}>
			<ListCollectionFor collection={collection}>
				{(item) => {
					const value = collection.getItemValue(item);
					if (!value) return null;
					const label = collection.stringifyItem(item);
					const disabled = collection.getItemDisabled(item);
					return (
						<Builder.Item key={value} value={value} disabled={disabled} onClickCapture={handleClickCapture}>
							{label}
						</Builder.Item>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
