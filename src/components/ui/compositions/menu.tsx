import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Portal } from "@ark-ui/react/portal";
import { ChevronDownIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, RefObject } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/menu";

export interface MenuProps<T extends CollectionItem> {
	children?: ComposableFn<[Indicator: typeof Indicator]>;
	collection: ListCollection<T>;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
}

function Indicator({ ...rest }: LucideProps) {
	return (
		<Builder.Indicator>
			<ChevronDownIcon {...rest} />
		</Builder.Indicator>
	);
}

function Overlay<T extends CollectionItem>({ collection, portalled = true, portalRef }: MenuProps<T>) {
	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Positioner>
				<Builder.Content>
					<ForListCollection collection={collection}>
						{(_, { value, label }) => (
							<Builder.Item key={value} value={value}>
								{label}
							</Builder.Item>
						)}
					</ForListCollection>
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

export function Menu<T extends CollectionItem>({ children, collection, portalled, portalRef, ...rest }: Assign<ComponentProps<typeof Builder.Root>, MenuProps<T>>) {
	const Trigger = useRender(Builder.Trigger, toPolymorphic("div"));
	const renderTrigger = useComposable(children, (Indicator) => <Indicator size={16} />);

	return (
		<Builder.Root {...rest}>
			{children && <Trigger>{renderTrigger(Indicator)}</Trigger>}
			<Overlay collection={collection} portalled={portalled} portalRef={portalRef} />
		</Builder.Root>
	);
}
