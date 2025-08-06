import { PipetteIcon } from "lucide-react";
import type { ComponentProps } from "react";

import * as Builder from "$/components/ui/styled/color-picker";
import { HStack, VStack } from "$:styled-system/jsx";

export interface ColorPickerProps extends ComponentProps<typeof Builder.Root> {
	alpha?: boolean;
}
export function ColorPicker({ alpha, children, ...rest }: ColorPickerProps) {
	return (
		<Builder.Root {...rest}>
			<Builder.Control>
				<Builder.Trigger>
					{alpha && <Builder.TransparencyGrid />}
					<Builder.ValueSwatch />
				</Builder.Trigger>
			</Builder.Control>
			<Builder.Positioner>
				<Builder.Content>
					<Builder.Area>
						<Builder.AreaBackground />
						<Builder.AreaThumb />
					</Builder.Area>
					<Builder.ChannelSlider channel="hue">
						<Builder.ChannelSliderTrack />
						<Builder.ChannelSliderThumb />
					</Builder.ChannelSlider>
					{alpha && (
						<Builder.ChannelSlider channel="alpha">
							<Builder.TransparencyGrid />
							<Builder.ChannelSliderTrack />
							<Builder.ChannelSliderThumb />
						</Builder.ChannelSlider>
					)}
					<VStack>
						<Builder.FormatTrigger>
							<Builder.Context>{(ctx) => ctx.format}</Builder.Context>
						</Builder.FormatTrigger>
						<Builder.View format="rgba">
							<Builder.ChannelInput channel="red" />
							<Builder.ChannelInput channel="green" />
							<Builder.ChannelInput channel="blue" />
							{alpha && <Builder.ChannelInput channel="alpha" />}
						</Builder.View>
						<Builder.View format="hsla">
							<Builder.ChannelInput channel="hue" />
							<Builder.ChannelInput channel="saturation" />
							<Builder.ChannelInput channel="lightness" />
						</Builder.View>
						<Builder.View format="hsba">
							<Builder.ChannelInput channel="hue" />
							<Builder.ChannelInput channel="saturation" />
							<Builder.ChannelInput channel="brightness" />
						</Builder.View>
						<HStack>
							<Builder.EyeDropperTrigger>
								<PipetteIcon size={16} />
							</Builder.EyeDropperTrigger>
						</HStack>
					</VStack>
				</Builder.Content>
			</Builder.Positioner>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.HiddenInput />
		</Builder.Root>
	);
}
