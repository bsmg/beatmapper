import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { UseTabsContext } from "@ark-ui/react/tabs";
import { type ComponentProps, type KeyboardEvent, type MouseEvent, type ReactNode, useCallback } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/tabs";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

export interface TabsProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root>, Pick<SystemStyleObject, "colorPalette"> {
	collection: ListCollection<T>;
	renderItem: (item: T, ctx: UseTabsContext) => ReactNode;
	unfocusOnClick?: boolean;
}
export function Tabs<T extends CollectionItem>({ collection, renderItem, colorPalette = "pink", unfocusOnClick, ...rest }: TabsProps<T>) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root defaultValue={rest.defaultValue ?? collection.firstValue} {...rest}>
			<Builder.List className={css({ colorPalette })}>
				<ForListCollection collection={collection}>
					{(_, { value, label, disabled }) => (
						<Builder.Trigger key={value} value={value} disabled={disabled} onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
							{label}
						</Builder.Trigger>
					)}
				</ForListCollection>
				<Builder.Indicator />
			</Builder.List>
			<ForListCollection collection={collection}>
				{(item, { value }) => (
					<Builder.Content key={value} value={value} tabIndex={-1}>
						<Builder.Context key={value}>{(ctx) => renderItem(item, ctx)}</Builder.Context>
					</Builder.Content>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
