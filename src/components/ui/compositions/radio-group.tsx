import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Presence } from "@ark-ui/react/presence";
import type { ComponentProps } from "react";

import { css } from "$:styled-system/css";
import { Circle } from "$:styled-system/jsx";
import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/radio-group";

export interface RadioItem extends CollectionItem {}

export interface RadioGroupProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function RadioGroup<T extends CollectionItem>({ collection, children, ...rest }: RadioGroupProps<T>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<ListCollectionFor collection={collection}>
				{(item) => (
					<Builder.Item key={item.value} value={item.value}>
						<Builder.ItemControl>
							<Builder.Context>
								{(ctx) => (
									<Presence asChild present={ctx.value === item.value}>
										<Circle size={8} className={css({ backgroundColor: "black" })} />
									</Presence>
								)}
							</Builder.Context>
						</Builder.ItemControl>
						<Builder.ItemText>{item.label}</Builder.ItemText>
						<Builder.ItemHiddenInput />
					</Builder.Item>
				)}
			</ListCollectionFor>
		</Builder.Root>
	);
}
