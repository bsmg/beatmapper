import type { Assign } from "@ark-ui/react";
import type { CollectionItem, ListCollection } from "@ark-ui/react/collection";
import type { RadioGroupItemBaseProps } from "@ark-ui/react/radio-group";
import { type ComponentProps, type CSSProperties, forwardRef, type PropsWithChildren } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import * as Builder from "$/components/ui/styled/radio-button-group";
import { Field, type FieldProps } from "./field";

function getItemStyles(item: CollectionItem): CSSProperties {
	return { "--current-color": typeof item === "object" && !!item && "color" in item ? item.color : undefined };
}

export interface RadioButtonProps {
	item: CollectionItem;
}

const RadioButton = forwardRef<HTMLInputElement, Assign<RadioGroupItemBaseProps, PropsWithChildren<RadioButtonProps>>>(function Radio({ item, children, ...rest }, ref) {
	return (
		<Builder.Item {...rest} style={getItemStyles(item)}>
			<Builder.ItemText>{children}</Builder.ItemText>
			<Builder.ItemHiddenInput ref={ref} />
		</Builder.Item>
	);
});

export interface RadioButtonGroupProps<T extends CollectionItem> {
	label?: string;
	collection: ListCollection<T>;
}

export function RadioButtonGroup<T extends CollectionItem>({ label, collection, ...rest }: Assign<ComponentProps<typeof Builder.Root>, RadioButtonGroupProps<T>>) {
	return (
		<Builder.Root defaultValue={collection.firstValue} {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Indicator />
			<ForListCollection collection={collection}>
				{(item, { value, label, disabled }) => (
					<RadioButton key={value} item={item} value={value} disabled={disabled}>
						<Builder.ItemText>{label}</Builder.ItemText>
						<Builder.ItemHiddenInput />
					</RadioButton>
				)}
			</ForListCollection>
		</Builder.Root>
	);
}

export function RadioButtonGroupDataField<T extends CollectionItem>({ label, helperText, ...delegated }: Assign<ComponentProps<typeof RadioButtonGroup<T>>, FieldProps>) {
	const [field, { required, invalid, errorText }] = useFieldData<string | null>(delegated);

	return (
		<Field id={field.name} cosmetic label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<RadioButtonGroup {...delegated} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
