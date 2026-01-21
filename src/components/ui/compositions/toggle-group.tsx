import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { type ComponentProps, type MouseEventHandler, useCallback } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/toggle-group";

export interface ToggleGroupProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
	unfocusOnClick?: boolean;
}
export function ToggleGroup<T extends CollectionItem>({ collection, unfocusOnClick, ...rest }: ToggleGroupProps<T>) {
	const handleClickCapture = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(event) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root {...rest} tabIndex={-1}>
			<ForListCollection collection={collection}>
				{(_, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled} onClickCapture={handleClickCapture}>
						{label}
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
