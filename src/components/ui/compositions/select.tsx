import type { Assign, CollectionItem, ListCollection, SelectRootProps } from "@ark-ui/react";
import { Portal } from "@ark-ui/react/portal";
import { ChevronDownIcon } from "lucide-react";
import type { PropsWithChildren } from "react";

import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/select";

export interface SelectItem extends CollectionItem {}

export interface SelectProps<T extends SelectItem> extends Assign<SelectRootProps<SelectItem>, PropsWithChildren> {
	collection: ListCollection<T>;
	size?: "sm" | "md";
	placeholder?: string;
}
export function Select<T extends SelectItem>({ collection, placeholder, children, ...rest }: SelectProps<T>) {
	return (
		<Builder.Root collection={collection as ListCollection<SelectItem>} {...rest}>
			<Builder.Control>
				<Builder.Trigger>
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
