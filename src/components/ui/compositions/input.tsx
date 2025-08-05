import type { Assign } from "@ark-ui/react";
import { type ChangeEvent, type ComponentProps, useCallback } from "react";

import { type UseControlledValueProps, useControlledValue } from "$/components/ui/hooks";
import { Input as StyledInput, Select as StyledSelect, Textarea as StyledTextarea } from "$/components/ui/styled/input";
import type { VirtualColorPalette } from "$/styles/types";
import { css, cx } from "$:styled-system/css";

export interface InputProps extends Assign<ComponentProps<typeof StyledInput>, UseControlledValueProps<{ value: string | number; valueAsString: string; valueAsNumber: number; valueAsDate: Date | null }>> {
	colorPalette?: VirtualColorPalette;
}
export function Input({ colorPalette = "pink", className, onValueChange, ...rest }: InputProps) {
	const [value, setValue] = useControlledValue({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange: onValueChange });
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValue({ value: e.target.value, valueAsString: e.target.value.toString(), valueAsNumber: e.target.valueAsNumber, valueAsDate: e.target.valueAsDate });
		},
		[setValue],
	);

	return <StyledInput {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={handleChange} />;
}

export interface NativeSelectProps extends Assign<ComponentProps<typeof StyledSelect>, UseControlledValueProps<{ value: string }>> {
	colorPalette?: VirtualColorPalette;
}
export function NativeSelect({ colorPalette = "pink", className, onValueChange, ...rest }: NativeSelectProps) {
	const [value, setValue] = useControlledValue({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange });
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			setValue({ value: e.target.value });
		},
		[setValue],
	);

	return <StyledSelect {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={handleChange} />;
}

export interface TextareaProps extends Assign<ComponentProps<typeof StyledTextarea>, UseControlledValueProps<{ value: string }>> {
	colorPalette?: VirtualColorPalette;
}
export function Textarea({ colorPalette = "pink", className, onValueChange, ...rest }: TextareaProps) {
	const [value, setValue] = useControlledValue({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange: onValueChange });
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			setValue({ value: e.target.value });
		},
		[setValue],
	);

	return <StyledTextarea {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={handleChange} />;
}
