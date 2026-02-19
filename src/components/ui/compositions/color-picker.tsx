import type { Assign } from "@ark-ui/react";
import { type Color, type ColorPickerChannelInputBaseProps, type ColorPickerChannelSliderBaseProps, useColorPickerContext } from "@ark-ui/react/color-picker";
import { Portal } from "@ark-ui/react/portal";
import { PipetteIcon } from "lucide-react";
import { type ComponentProps, forwardRef, type RefObject } from "react";

import { Switch } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { type ComposableFn, useComposable } from "$/components/ui/hooks/use-composable";
import * as Builder from "$/components/ui/styled/color-picker";
import { Flex, HStack, Stack } from "$:styled-system/jsx";
import { Field, type FieldProps } from "./field";

export interface ColorPickerProps {
	label?: string;
	showAlpha?: boolean;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
}

function ChannelSlider({ showAlpha, ...rest }: Assign<ColorPickerChannelSliderBaseProps, ColorPickerProps>) {
	return (
		<Builder.ChannelSlider {...rest}>
			{showAlpha && <Builder.TransparencyGrid />}
			<Builder.ChannelSliderTrack />
			<Builder.ChannelSliderThumb />
		</Builder.ChannelSlider>
	);
}
function ChannelInput({ channel, ...rest }: Assign<ColorPickerChannelInputBaseProps, ColorPickerProps>) {
	return <Builder.ChannelInput channel={channel} {...rest} />;
}

function Sliders({ showAlpha }: ColorPickerProps) {
	const api = useColorPickerContext();

	return (
		<Switch value={api.format}>
			{(Match) => (
				<Stack>
					<Match when={(format) => format === "rgba"}>
						<ChannelSlider channel="red" showAlpha={showAlpha} />
						<ChannelSlider channel="green" showAlpha={showAlpha} />
						<ChannelSlider channel="blue" showAlpha={showAlpha} />
					</Match>
					<Match when={(format) => format === "hsba"}>
						<ChannelSlider channel="hue" showAlpha={showAlpha} />
						<ChannelSlider channel="saturation" showAlpha={showAlpha} />
						<ChannelSlider channel="brightness" showAlpha={showAlpha} />
					</Match>
					<Match when={(format) => format === "hsla"}>
						<ChannelSlider channel="hue" showAlpha={showAlpha} />
						<ChannelSlider channel="saturation" showAlpha={showAlpha} />
						<ChannelSlider channel="lightness" showAlpha={showAlpha} />
					</Match>
					{showAlpha && <ChannelSlider channel="alpha" showAlpha={showAlpha} />}
				</Stack>
			)}
		</Switch>
	);
}
function ChannelInputs({ showAlpha }: ColorPickerProps) {
	const api = useColorPickerContext();

	return (
		<Switch value={api.format}>
			{(Match) => (
				<HStack>
					<Match when={(format) => format === "rgba"}>
						<ChannelInput channel="red" />
						<ChannelInput channel="green" />
						<ChannelInput channel="blue" />
					</Match>
					<Match when={(format) => format === "hsba"}>
						<ChannelInput channel="hue" />
						<ChannelInput channel="saturation" />
						<ChannelInput channel="brightness" />
					</Match>
					<Match when={(format) => format === "hsla"}>
						<ChannelInput channel="hue" />
						<ChannelInput channel="saturation" />
						<ChannelInput channel="lightness" />
					</Match>
					{showAlpha && <ChannelInput channel="alpha" />}
				</HStack>
			)}
		</Switch>
	);
}

function Overlay({ showAlpha, portalled = true, portalRef }: ColorPickerProps) {
	const api = useColorPickerContext();

	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Positioner>
				<Builder.Content>
					<Builder.Area>
						<Builder.AreaBackground />
						<Builder.AreaThumb />
					</Builder.Area>
					<Flex>
						<Builder.FormatTrigger>{api.format}</Builder.FormatTrigger>
						<Builder.EyeDropperTrigger>
							<PipetteIcon size={16} />
						</Builder.EyeDropperTrigger>
					</Flex>
					<Builder.View format={api.format}>
						<Sliders showAlpha={showAlpha} />
						<ChannelInputs showAlpha={showAlpha} />
					</Builder.View>
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

function SwatchTrigger({ showAlpha }: ColorPickerProps) {
	return (
		<Builder.Trigger>
			{showAlpha && <Builder.TransparencyGrid />}
			<Builder.ValueSwatch />
		</Builder.Trigger>
	);
}

interface ColorPickerComposableProps extends ColorPickerProps {
	children?: ComposableFn<[controls: { SwatchTrigger: typeof SwatchTrigger }]>;
}
export const ColorPicker = forwardRef<HTMLInputElement, Assign<ComponentProps<typeof Builder.Root>, ColorPickerComposableProps>>(function ColorPicker({ label, showAlpha, portalled, portalRef, children, ...rest }, ref) {
	const renderControl = useComposable(children, ({ SwatchTrigger }) => <SwatchTrigger showAlpha={showAlpha} />);

	return (
		<Builder.Root {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Control>{renderControl({ SwatchTrigger })}</Builder.Control>
			<Overlay showAlpha={showAlpha} portalled={portalled} portalRef={portalRef} />
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});

export function ColorPickerDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof ColorPicker>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<Color>(delegated);

	return (
		<Field id={id} cosmetic label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<ColorPicker {...delegated} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
