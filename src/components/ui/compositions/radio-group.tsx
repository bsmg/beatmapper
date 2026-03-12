import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { RadioGroupItemBaseProps } from "@ark-ui/react/radio-group";
import { type ComponentProps, forwardRef, type PropsWithChildren } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import * as Builder from "$/components/ui/styled/radio-group";
import { Field, type FieldProps } from "./field";

export interface RadioProps {
	item: CollectionItem;
}

const Radio = forwardRef<HTMLInputElement, Assign<RadioGroupItemBaseProps, PropsWithChildren<RadioProps>>>(function Radio({ children, ...rest }, ref) {
	return (
		<Builder.Item {...rest}>
			<Builder.ItemControl />
			<Builder.ItemText>{children}</Builder.ItemText>
			<Builder.ItemHiddenInput ref={ref} />
		</Builder.Item>
	);
});

export interface RadioGroupProps<T extends CollectionItem> {
	label?: string;
	collection: ListCollection<T>;
}

export function RadioGroup<T extends CollectionItem>({ label, collection, ...rest }: Assign<ComponentProps<typeof Builder.Root>, RadioGroupProps<T>>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<ForListCollection collection={collection}>
				{(item, { value, label, disabled }) => (
					<Radio key={value} item={item} value={value} disabled={disabled}>
						{label}
					</Radio>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}

export function RadioGroupDataField<T extends CollectionItem>({ label, helperText, ...delegated }: Assign<ComponentProps<typeof RadioGroup<T>>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string | null>(delegated);

	return (
		<Field id={id} cosmetic label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<RadioGroup {...delegated} id={id} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
