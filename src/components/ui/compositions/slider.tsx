import type { Assign } from "@ark-ui/react";
import type { SliderThumbBaseProps } from "@ark-ui/react/slider";
import { type ComponentProps, Fragment, forwardRef } from "react";

import { For } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/slider";
import { Field, type FieldProps } from "./field";

export interface SliderProps extends UseInteractableOptions {
	label?: string;
	marks?: Array<number>;
}

function Track() {
	return (
		<Builder.Track>
			<Builder.Range />
		</Builder.Track>
	);
}
const Thumb = forwardRef<HTMLInputElement, Assign<SliderThumbBaseProps, SliderProps>>(({ ...rest }, ref) => {
	return (
		<Builder.Thumb {...rest}>
			<Builder.HiddenInput ref={ref} />
		</Builder.Thumb>
	);
});
function Marks({ marks }: SliderProps) {
	return (
		<Builder.MarkerGroup>
			<For each={marks}>{(value) => <Builder.Marker key={value} value={value} />}</For>
		</Builder.MarkerGroup>
	);
}

interface SliderComposableProps extends SliderProps {
	children?: ComposableFn<[controls: { Track: typeof Track; Thumb: typeof Thumb; Marks: typeof Marks }]>;
}
export function Slider({ children, label, marks, unfocusOnPress, ...rest }: Assign<ComponentProps<typeof Builder.Root>, SliderComposableProps>) {
	const renderControl = useComposable(children, () => (
		<Fragment>
			<Track />
			<Thumb index={0} />
			<Marks marks={marks} />
		</Fragment>
	));

	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root thumbAlignment="center" {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
				{renderControl({ Track, Thumb, Marks })}
			</Builder.Control>
		</Builder.Root>
	);
}

export function SliderDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof Slider>, FieldProps>) {
	const [field, { required, invalid, errorText }] = useFieldData<number[]>(delegated);

	return (
		<Field id={field.name} cosmetic label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<Slider {...delegated} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
