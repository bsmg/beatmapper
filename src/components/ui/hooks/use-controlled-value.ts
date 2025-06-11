import { useCallback, useMemo, useState } from "react";

export interface UseControlledValueProps<T extends { value: string | number } = { value: string | number }> {
	value?: T["value"];
	defaultValue?: T["value"];
	onValueChange?: (details: T) => void;
}
export function useControlledValue<T extends { value: string | number } = { value: string | number }>(props: UseControlledValueProps<T>) {
	const { value, defaultValue, onValueChange } = props;
	const [internalValue, setInternalValue] = useState<T["value"] | undefined>(defaultValue);

	const controlled = useMemo(() => value !== undefined, [value]);
	const currentValue = useMemo(() => (controlled ? value : internalValue), [controlled, value, internalValue]);

	const setValue = useCallback(
		(details: T) => {
			if (controlled !== null || controlled !== undefined) setInternalValue(details.value);
			if (onValueChange) onValueChange(details);
		},
		[controlled, onValueChange],
	);

	return [currentValue, setValue] as const;
}
