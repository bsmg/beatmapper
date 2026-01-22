import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Portal } from "@ark-ui/react/portal";
import type { SelectRootProps } from "@ark-ui/react/select";
import { ChevronDownIcon } from "lucide-react";
import { type PropsWithChildren, useRef } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/select";

export interface SelectProps<T extends CollectionItem> extends Assign<SelectRootProps<CollectionItem>, PropsWithChildren>, UseInteractableOptions {
	collection: ListCollection<T>;
	size?: "sm" | "md";
	placeholder?: string;
}
export function Select<T extends CollectionItem>({ collection, placeholder, children, unfocusOnPress, ...rest }: SelectProps<T>) {
	const ref = useRef<HTMLDivElement>(null);

	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root ref={ref} collection={collection as ListCollection<CollectionItem>} {...rest} onKeyDown={(e) => e.stopPropagation()}>
			<Builder.Control>
				<Builder.Trigger onClickCapture={handlePress} onKeyDownCapture={handlePress}>
					{children && <Builder.Label>{children}</Builder.Label>}
					<Builder.ValueText placeholder={placeholder} />
					<Builder.Indicator>
						<ChevronDownIcon size={16} />
					</Builder.Indicator>
				</Builder.Trigger>
			</Builder.Control>
			<Portal>
				<Builder.Positioner>
					<Builder.Content>
						<ForListCollection collection={collection}>
							{(_, { value, label }) => (
								<Builder.Item key={value} item={value}>
									<Builder.ItemText>{label}</Builder.ItemText>
									<Builder.ItemIndicator>✓</Builder.ItemIndicator>
								</Builder.Item>
							)}
						</ForListCollection>
					</Builder.Content>
				</Builder.Positioner>
			</Portal>
			<Builder.HiddenSelect />
		</Builder.Root>
	);
}
