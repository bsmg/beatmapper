import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type UseControlledStateOptions, useInputState } from "$/components/ui/hooks/use-controlled-state";
import * as Builder from "$/components/ui/styled/field";
import { Input as Styled } from "$/components/ui/styled/input";
import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import { Field, type FieldProps } from "./field";

export interface InputProps extends UseControlledStateOptions<{ valueAsString: string; valueAsNumber: number; valueAsDate: Date | null }>, Pick<SystemStyleObject, "colorPalette"> {}

export function Input({ colorPalette = "pink", className, onValueChange, ...rest }: Assign<ComponentProps<typeof Styled>, InputProps>) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLInputElement) => {
		return { value: target.value, valueAsString: target.value.toString(), valueAsNumber: target.valueAsNumber, valueAsDate: target.valueAsDate };
	});
	return <Styled {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}
export function FieldInput({ ...rest }: ComponentProps<typeof Input>) {
	return <Input as={Builder.Input} {...rest} />;
}

export function InputDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof Input>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<FieldInput {...delegated} id={id} value={field.state.value} onValueChange={(details) => field.handleChange(details.valueAsString)} />
		</Field>
	);
}
export function NumberInputDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof Input>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<number>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<FieldInput {...delegated} id={id} type="number" step={delegated.step ?? "any"} value={field.state.value.toString()} onValueChange={(details) => field.handleChange(details.valueAsNumber)} />
		</Field>
	);
}
