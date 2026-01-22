import type { Assign } from "@ark-ui/react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";

export type InputValue = string | number | readonly string[];

export interface UseControlledStateOptions<T> {
	value?: InputValue;
	defaultValue?: InputValue;
	onValueChange?: (details: Assign<T, { value: InputValue }>) => void;
}
export function useControlledState<T>({ value, defaultValue, onValueChange }: UseControlledStateOptions<T>): [value: InputValue | undefined, setValue: (details: Assign<T, { value: InputValue }>) => void] {
	const [internalValue, setInternalValue] = useState<InputValue | undefined>(defaultValue);

	const controlled = useMemo(() => value !== undefined, [value]);
	const currentValue = useMemo(() => (controlled ? value : internalValue), [controlled, value, internalValue]);

	const setValue = useCallback(
		(details: Assign<T, { value: InputValue }>) => {
			if (controlled !== null || controlled !== undefined) setInternalValue(details.value);
			if (onValueChange) onValueChange(details);
		},
		[controlled, onValueChange],
	);

	return [currentValue, setValue];
}

export function useInputState<T, TElement>(options: UseControlledStateOptions<T>, onChange: (e: TElement) => Assign<T, { value: InputValue }>): [value: InputValue | undefined, onChange: (e: ChangeEvent<TElement>) => void] {
	const [value, setValue] = useControlledState(options);

	const handleChange = useCallback(
		(e: ChangeEvent<TElement>) => {
			setValue(onChange(e.target));
		},
		[setValue, onChange],
	);

	return [value, handleChange];
}
