import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { type UseControlledStateOptions, useInputState } from "$/components/ui/hooks/use-controlled-state";
import { Input as StyledInput, Select as StyledSelect, Textarea as StyledTextarea } from "$/components/ui/styled/input";
import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

export interface InputProps extends Assign<ComponentProps<typeof StyledInput>, UseControlledStateOptions<{ valueAsString: string; valueAsNumber: number; valueAsDate: Date | null }>>, Pick<SystemStyleObject, "colorPalette"> {}
export function Input({ colorPalette = "pink", className, onValueChange, ...rest }: InputProps) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLInputElement) => {
		return { value: target.value, valueAsString: target.value.toString(), valueAsNumber: target.valueAsNumber, valueAsDate: target.valueAsDate };
	});
	return <StyledInput {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}

export interface NativeSelectProps extends Assign<ComponentProps<typeof StyledSelect>, UseControlledStateOptions<{ valueAsString: string }>>, Pick<SystemStyleObject, "colorPalette"> {}
export function NativeSelect({ colorPalette = "pink", className, onValueChange, ...rest }: NativeSelectProps) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLSelectElement) => {
		return { value: target.value, valueAsString: target.value.toString() };
	});
	return <StyledSelect {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}

export interface TextareaProps extends Assign<ComponentProps<typeof StyledTextarea>, UseControlledStateOptions<{ valueAsString: string }>>, Pick<SystemStyleObject, "colorPalette"> {}
export function Textarea({ colorPalette = "pink", className, onValueChange, ...rest }: TextareaProps) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLTextAreaElement) => {
		return { value: target.value, valueAsString: target.value.toString() };
	});
	return <StyledTextarea {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}
