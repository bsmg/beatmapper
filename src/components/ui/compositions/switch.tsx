import type { Assign } from "@ark-ui/react";
import { type ComponentProps, forwardRef } from "react";

import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/switch";
import { Field, type FieldProps } from "./field";

export interface SwitchProps extends UseInteractableOptions {
	label?: string;
}

function Thumb() {
	return <Builder.Thumb />;
}

interface SwitchComposableProps extends SwitchProps {
	children?: ComposableFn<[controls: { Thumb: typeof Thumb }]>;
}
export const Switch = forwardRef<HTMLInputElement, Assign<ComponentProps<typeof Builder.Root>, SwitchComposableProps>>(function Switch({ children, label, unfocusOnPress, ...rest }, ref) {
	const renderControl = useComposable(children, ({ Thumb }) => <Thumb />);

	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
				{renderControl({ Thumb })}
			</Builder.Control>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});

export function SwitchDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof Switch>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<boolean>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<Switch {...delegated} checked={field.state.value} onCheckedChange={(details) => field.handleChange(!!details.checked)} />
		</Field>
	);
}
