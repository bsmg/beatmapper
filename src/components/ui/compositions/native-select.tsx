import type { Assign } from "@ark-ui/react";
import type { ListCollection } from "@ark-ui/react/collection";
import type { ComponentProps } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type UseControlledStateOptions, useInputState } from "$/components/ui/hooks/use-controlled-state";
import * as Builder from "$/components/ui/styled/field";
import { Select as Styled } from "$/components/ui/styled/input";
import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import { Field, type FieldProps } from "./field";

export interface NativeSelectProps extends UseControlledStateOptions<{ valueAsString: string }>, Pick<SystemStyleObject, "colorPalette"> {}

export function NativeSelect({ colorPalette = "pink", className, onValueChange, ...rest }: Assign<ComponentProps<typeof Styled>, NativeSelectProps>) {
	const [value, onChange] = useInputState({ value: rest.value, defaultValue: rest.defaultValue ?? "", onValueChange }, (target: HTMLSelectElement) => {
		return { value: target.value, valueAsString: target.value.toString() };
	});
	return <Styled {...rest} className={cx(css({ colorPalette: colorPalette }), className)} value={value} onChange={onChange} />;
}
export function FieldSelect({ ...rest }: ComponentProps<typeof NativeSelect>) {
	return <NativeSelect as={Builder.Select} {...rest} />;
}

export interface NativeSelectGroupProps extends NativeSelectProps {
	collection: ListCollection;
}

export function NativeSelectGroup({ collection, ...rest }: Assign<ComponentProps<typeof NativeSelect>, NativeSelectGroupProps>) {
	return (
		<NativeSelect {...rest}>
			<ForListCollection collection={collection}>
				{(_, { value, label }) => (
					<option key={value} value={value}>
						{label}
					</option>
				)}
			</ForListCollection>
		</NativeSelect>
	);
}
export function FieldSelectGroup({ ...rest }: ComponentProps<typeof NativeSelectGroup>) {
	return <NativeSelectGroup as={Builder.Select} {...rest} />;
}

export function SelectDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof NativeSelectGroup>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<FieldSelectGroup {...delegated} value={field.state.value} onValueChange={(details) => field.handleChange(details.valueAsString)} />
		</Field>
	);
}
