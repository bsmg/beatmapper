import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { UseTabsContext } from "@ark-ui/react/tabs";
import { type ComponentProps, type KeyboardEvent, type MouseEvent, type ReactNode, useCallback } from "react";

import { ListCollectionFor } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/tabs";
import type { VirtualColorPalette } from "$/styles/types";
import { css } from "$:styled-system/css";

export interface TabsItem extends CollectionItem {
	value: string;
	render: (ctx: UseTabsContext) => ReactNode;
}

export interface TabsProps<T extends TabsItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
	colorPalette?: VirtualColorPalette;
	unfocusOnClick?: boolean;
}
export function Tabs<T extends TabsItem>({ collection, colorPalette = "pink", unfocusOnClick, ...rest }: TabsProps<T>) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root defaultValue={rest.defaultValue ?? collection.firstValue} {...rest}>
			<Builder.List className={css({ colorPalette })}>
				<ListCollectionFor collection={collection}>
					{(item) => {
						const value = collection.getItemValue(item);
						if (!value) return null;
						const label = collection.stringifyItem(item);
						const disabled = collection.getItemDisabled(item);
						return (
							<Builder.Trigger key={value} value={value} disabled={disabled} onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
								{label}
							</Builder.Trigger>
						);
					}}
				</ListCollectionFor>
				<Builder.Indicator />
			</Builder.List>
			<ListCollectionFor collection={collection}>
				{(item) => {
					const value = collection.getItemValue(item);
					if (!value) return null;
					return (
						<Builder.Context key={value}>
							{(ctx) => (
								<Builder.Content key={value} value={value} tabIndex={-1}>
									{item.render(ctx)}
								</Builder.Content>
							)}
						</Builder.Context>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
