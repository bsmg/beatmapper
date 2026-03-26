import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import { Fragment, type ReactNode, useMemo } from "react";

interface ForProps<T> {
	each: T[] | readonly T[] | undefined;
	fallback?: React.ReactNode;
	interleave?: ReactNode | ((index: number) => ReactNode);
	children: (item: Exclude<T, null | undefined>, index: number, array: Exclude<T, null | undefined>[]) => ReactNode;
}
export function For<T>({ each, fallback, interleave, children }: ForProps<T>) {
	return useMemo(() => {
		if (!each || each.length === 0) return fallback ?? null;

		const items = each.filter((x): x is Exclude<T, null | undefined> => x !== null && x !== undefined);

		if (items.length === 0) return fallback ?? null;

		return items.map((value, index, array) => {
			const isLast = index === items.length - 1;
			const itemKey = index;
			return (
				<Fragment key={itemKey}>
					{children(value as Exclude<T, null | undefined>, index, array as Exclude<T, null | undefined>[])}
					{!isLast && interleave && <Fragment key={`interleave-${itemKey}`}>{typeof interleave === "function" ? interleave(index) : interleave}</Fragment>}
				</Fragment>
			);
		});
	}, [each, fallback, children, interleave]);
}

interface ForListCollectionProps<T> extends Omit<ForProps<T>, "each" | "children"> {
	collection: ListCollection<T>;
	children: (item: Exclude<T, null | undefined>, computed: { value: string; label: string | null; disabled: boolean }) => ReactNode;
}
export function ForListCollection<T extends CollectionItem>({ collection, children }: ForListCollectionProps<T>) {
	const items = useMemo(() => {
		return collection.items.map((item) => {
			const value = collection.getItemValue(item);

			if (value === null) return null;

			const computed: Parameters<typeof children>[1] = {
				value,
				label: collection.stringifyItem(item),
				disabled: collection.getItemDisabled(item),
			};

			return [item, computed] as Parameters<typeof children>;
		});
	}, [collection]);

	return <For each={items}>{(payload) => (typeof children === "function" && payload ? children(payload[0] as Exclude<T, null | undefined>, payload[1]) : null)}</For>;
}
