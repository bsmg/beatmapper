import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/toggle-group";

export interface ToggleGroupProps<T extends CollectionItem> extends UseInteractableOptions {
	collection: ListCollection<T>;
}

export function ToggleGroup<T extends CollectionItem>({ collection, unfocusOnPress, ...rest }: Assign<ComponentProps<typeof Builder.Root>, ToggleGroupProps<T>>) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest} tabIndex={-1}>
			<ForListCollection collection={collection}>
				{(_, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled} onClickCapture={handlePress} onKeyDownCapture={handlePress}>
						{label}
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
