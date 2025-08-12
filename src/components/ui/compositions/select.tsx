import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Portal } from "@ark-ui/react/portal";
import type { SelectRootProps } from "@ark-ui/react/select";
import { ChevronDownIcon } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, type PropsWithChildren, useCallback, useRef } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/select";

export interface SelectItem extends CollectionItem {}

export interface SelectProps<T extends SelectItem> extends Assign<SelectRootProps<SelectItem>, PropsWithChildren> {
	collection: ListCollection<T>;
	size?: "sm" | "md";
	placeholder?: string;
	unfocusOnClick?: boolean;
}
export function Select<T extends SelectItem>({ collection, placeholder, children, unfocusOnClick, ...rest }: SelectProps<T>) {
	const ref = useRef<HTMLDivElement>(null);

	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root ref={ref} collection={collection as ListCollection<SelectItem>} {...rest} onKeyDown={(e) => e.stopPropagation()}>
			<Builder.Control>
				<Builder.Trigger onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
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
						<ListCollectionFor collection={collection}>
							{(item) => {
								const value = collection.getItemValue(item);
								if (!value) return null;
								const label = collection.stringifyItem(item);
								return (
									<Builder.Item key={value} item={value}>
										<Builder.ItemText>{label}</Builder.ItemText>
										<Builder.ItemIndicator>✓</Builder.ItemIndicator>
									</Builder.Item>
								);
							}}
						</ListCollectionFor>
					</Builder.Content>
				</Builder.Positioner>
			</Portal>
			<Builder.HiddenSelect />
		</Builder.Root>
	);
}
