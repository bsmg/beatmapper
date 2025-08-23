import type { Assign } from "@ark-ui/react";
import type { ListCollection } from "@ark-ui/react/collection";
import { type AnyFieldApi, createFormHook, createFormHookContexts, useStore } from "@tanstack/react-form";
import { type ComponentProps, type MouseEvent, type ReactNode, useCallback } from "react";

import * as Builder from "$/components/ui/styled/form";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Field, type FieldProps } from "./field";
import { Input, NativeSelect, Textarea } from "./input";
import { RadioButtonGroup, type RadioButtonGroupProps } from "./radio-button-group";
import { RadioGroup, type RadioGroupProps, type RadioItem } from "./radio-group";
import { Switch } from "./switch";
import { TagsInput } from "./tags-input";
import { ToggleGroup, type ToggleGroupProps, type ToggleItem } from "./toggle-group";

const { useFieldContext, useFormContext, fieldContext, formContext } = createFormHookContexts();

type DataFieldProps = Omit<FieldProps, "errorText">;

function useFieldError(field: AnyFieldApi) {
	const errors = useStore(field.store, (state) => state.meta.errors);
	return errors[0];
}

function WrapperField<T extends AnyFieldApi>({ label, helperText, children, ...rest }: Omit<DataFieldProps, "children"> & { children: (field: T) => ReactNode }) {
	const field = useFieldContext<string>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			{children(field as T)}
		</Field>
	);
}
function InputField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof Input>>) {
	const field = useFieldContext<string>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<Input id={rest.id ?? field.name} {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.valueAsString)} />
		</Field>
	);
}
function NumberInputField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof Input>>) {
	const field = useFieldContext<number>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<Input id={rest.id ?? field.name} {...rest} type="number" value={field.state.value.toString()} onValueChange={(details) => field.handleChange(details.valueAsNumber)} />
		</Field>
	);
}
function NativeSelectField({ label, helperText, collection, ...rest }: Assign<DataFieldProps & { collection: ListCollection }, ComponentProps<typeof NativeSelect>>) {
	const field = useFieldContext<string>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<NativeSelect id={rest.id ?? field.name} {...rest} value={field.state.value ?? ""} onValueChange={(details) => field.handleChange(details.value)}>
				{collection.items.map((item) => {
					const value = collection.getItemValue(item);
					if (value === null) return null;
					return (
						<option key={value} value={value}>
							{collection.stringifyItem(item)}
						</option>
					);
				})}
			</NativeSelect>
		</Field>
	);
}
function TextareaField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof Textarea>>) {
	const field = useFieldContext<string>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<Textarea id={rest.id ?? field.name} {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
function CheckboxField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof Checkbox>>) {
	const field = useFieldContext<boolean>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<Checkbox {...rest} checked={field.state.value} onCheckedChange={(details) => field.handleChange(!!details.checked)} />
		</Field>
	);
}
function SwitchField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof Switch>>) {
	const field = useFieldContext<boolean>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<Switch {...rest} checked={field.state.value} onCheckedChange={(details) => field.handleChange(!!details.checked)} />
		</Field>
	);
}
function RadioGroupField<T extends RadioItem>({ label, helperText, ...rest }: Assign<DataFieldProps, RadioGroupProps<T>>) {
	const field = useFieldContext<string | null>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<RadioGroup {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
function RadioButtonGroupField<T extends RadioItem>({ label, helperText, ...rest }: Assign<DataFieldProps, RadioButtonGroupProps<T>>) {
	const field = useFieldContext<string | null>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} cosmetic label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<RadioButtonGroup {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
function TagsInputField({ label, helperText, ...rest }: Assign<DataFieldProps, ComponentProps<typeof TagsInput>>) {
	const field = useFieldContext<string[]>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<TagsInput {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
function ToggleGroupField<T extends ToggleItem>({ label, helperText, ...rest }: Assign<DataFieldProps, ToggleGroupProps<T>>) {
	const field = useFieldContext<string[]>();
	const error = useFieldError(field);
	return (
		<Field id={rest.id ?? field.name} label={label} helperText={helperText} errorText={error?.message} invalid={!!error} required={rest.required}>
			<ToggleGroup {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}

function SubmitButton({ loading, disabled, children, onClick, ...rest }: ComponentProps<typeof Button>) {
	const form = useFormContext();

	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			form.handleSubmit();
			if (onClick) onClick(event);
		},
		[form, onClick],
	);

	return (
		<form.Subscribe>
			{(state) => (
				<Button variant="solid" size="md" {...rest} loading={state.isSubmitting} disabled={disabled || !state.canSubmit} onClick={handleClick}>
					{children ?? "Submit"}
				</Button>
			)}
		</form.Subscribe>
	);
}

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Wrapper: WrapperField,
		Input: InputField,
		NumberInput: NumberInputField,
		Select: NativeSelectField,
		Textarea: TextareaField,
		Checkbox: CheckboxField,
		RadioGroup: RadioGroupField,
		RadioButtonGroup: RadioButtonGroupField,
		Switch: SwitchField,
		TagsInput: TagsInputField,
		ToggleGroup: ToggleGroupField,
	},
	formComponents: {
		Root: Builder.Root,
		Row: Builder.Row,
		Submit: SubmitButton,
	},
});
