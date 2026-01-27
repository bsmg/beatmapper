import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Presence } from "@ark-ui/react/presence";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/radio-group";
import { css } from "$:styled-system/css";
import { Circle } from "$:styled-system/jsx";

export interface RadioGroupProps<T extends CollectionItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function RadioGroup<T extends CollectionItem>({ collection, children, ...rest }: RadioGroupProps<T>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<ForListCollection collection={collection}>
				{(_, { value, label, disabled }) => (
					<Builder.Item key={value} value={value} disabled={disabled}>
						<Builder.ItemControl>
							<Builder.Context>
								{(ctx) => (
									<Presence asChild present={ctx.value === value}>
										<Circle size={8} className={css({ backgroundColor: "black" })} />
									</Presence>
								)}
							</Builder.Context>
						</Builder.ItemControl>
						<Builder.ItemText>{label ?? value}</Builder.ItemText>
						<Builder.ItemHiddenInput />
					</Builder.Item>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}
