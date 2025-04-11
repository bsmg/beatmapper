import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { CSSProperties, ComponentProps, ReactNode } from "react";

import { ListCollectionFor } from "../atoms";
import * as Builder from "../styled/radio-button-group";
import { Tooltip } from "./tooltip";

export interface RadioButtonItem extends CollectionItem {
	value: string;
	tooltip?: ReactNode;
}

export interface RadioButtonGroupProps<T extends RadioButtonItem> extends ComponentProps<typeof Builder.Root> {
	collection: ListCollection<T>;
}
export function RadioButtonGroup<T extends RadioButtonItem>({ collection, children, ...rest }: RadioButtonGroupProps<T>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.Indicator />
			<ListCollectionFor collection={collection}>
				{(item) => {
					const style = { "--current-color": item.color } as CSSProperties;
					return (
						<Tooltip key={item.value} disabled={!item.tooltip} render={() => item.tooltip}>
							<Builder.Item value={item.value} disabled={item.disabled} data-disabled={item.disabled} style={style}>
								<Builder.ItemText>{item.label}</Builder.ItemText>
								<Builder.ItemHiddenInput />
							</Builder.Item>
						</Tooltip>
					);
				}}
			</ListCollectionFor>
		</Builder.Root>
	);
}
