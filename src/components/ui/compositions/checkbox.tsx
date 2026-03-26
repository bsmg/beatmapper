import type { Assign } from "@ark-ui/react";
import { type LucideProps, MinusIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, Fragment, forwardRef } from "react";

import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/checkbox";
import { Field, type FieldProps } from "./field";

export interface CheckboxProps extends UseInteractableOptions {
	label?: string;
	icon?: ComponentType<LucideProps>;
}

function Indicator({ icon: Icon = XIcon, ...rest }: Assign<LucideProps, CheckboxProps>) {
	return (
		<Fragment>
			<Builder.Indicator>
				<Icon {...rest} />
			</Builder.Indicator>
			<Builder.Indicator indeterminate>
				<MinusIcon {...rest} />
			</Builder.Indicator>
		</Fragment>
	);
}

export const Checkbox = forwardRef<HTMLInputElement, Assign<ComponentProps<typeof Builder.Root>, CheckboxProps>>(({ label, icon, unfocusOnPress, ...rest }, ref) => {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
				<Indicator icon={icon} size={16} />
			</Builder.Control>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});

export function CheckboxDataField({ label, checkboxLabel, helperText, ...delegated }: Assign<ComponentProps<typeof Checkbox>, FieldProps & { checkboxLabel?: string }>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<boolean>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<Checkbox {...delegated} id={id} label={checkboxLabel} checked={field.state.value} onCheckedChange={(details) => field.handleChange(!!details.checked)} />
		</Field>
	);
}
