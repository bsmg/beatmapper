import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type UseControlledStateOptions, useInputState } from "$/components/ui/hooks/use-controlled-state";
import * as Builder from "$/components/ui/styled/field";
import { Textarea as Styled } from "$/components/ui/styled/input";
import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import { Field, type FieldProps } from "./field";

export interface TextareaProps extends UseControlledStateOptions<{ valueAsString: string }>, Pick<SystemStyleObject, "colorPalette"> {}

export function Textarea({ className, onValueChange, colorPalette = "pink", ...rest }: Assign<ComponentProps<typeof Styled>, TextareaProps>) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLTextAreaElement) => {
		return { value: target.value, valueAsString: target.value.toString() };
	});
	return <Styled {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}
export function FieldTextarea({ ...rest }: ComponentProps<typeof Textarea>) {
	return <Textarea as={Builder.Textarea} {...rest} />;
}

export function TextareaDataField({ label, helperText, ...rest }: Assign<ComponentProps<typeof Textarea>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string>(rest);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<FieldTextarea {...rest} id={id} value={field.state.value} onValueChange={(details) => field.handleChange(details.valueAsString)} />
		</Field>
	);
}
