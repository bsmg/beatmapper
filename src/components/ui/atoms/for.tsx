import type { CollectionItem, ListCollection } from "@ark-ui/react";
import { useMemo } from "react";

interface ForProps<T> {
	each: T[] | readonly T[] | undefined;
	fallback?: React.ReactNode;
	children: (item: Exclude<T, null | undefined>, index: number) => React.ReactNode;
}
export function For<T>({ each, fallback, children }: ForProps<T>) {
	if (!each || each?.length === 0) return fallback || null;
	return each.filter((x) => !!x).map((value, index) => children(value as Exclude<T, null | undefined>, index));
}

interface ListCollectionForProps<T> {
	collection: ListCollection<T>;
	fallback?: React.ReactNode;
	children: (item: { value: string; label: string; disabled: boolean } & Exclude<T, null | undefined>, index: number) => React.ReactNode;
}
export function ListCollectionFor<T extends CollectionItem>({ collection, fallback, children }: ListCollectionForProps<T>) {
	const items = useMemo(() => {
		return collection.items.map((item) => {
			const value = collection.getItemValue(item);
			if (!value) return null;
			if (typeof item === "object") {
				return {
					value: value,
					label: collection.stringifyItem(item),
					disabled: collection.getItemDisabled(item),
					...item,
				};
			}
			return {
				value: value,
				label: collection.stringifyItem(item),
				disabled: collection.getItemDisabled(item),
			};
		});
	}, [collection]);

	if (items.length === 0) return fallback || null;
	return items.filter((x) => !!x).map((value, index) => children(value as { value: string; label: string; disabled: boolean } & Exclude<T, null | undefined>, index));
}
