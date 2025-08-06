"use client";

import { ColorPicker, colorPickerAnatomy } from "@ark-ui/react/color-picker";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { hstack, stack } from "$:styled-system/patterns";

const recipe = sva({
	slots: colorPickerAnatomy.keys(),
	base: {
		root: stack.raw({
			align: "center",
			gap: 1,
		}),
		label: {
			userSelect: "none",
		},
		content: stack.raw({
			padding: 1,
			fontSize: "14px",
			colorPalette: "slate",
			layerStyle: "fill.surface",
			animationStyle: { _open: "slide-fade-in", _closed: "slide-fade-out" },
			zIndex: 3,
		}),
		formatTrigger: {
			width: "100%",
			paddingBlock: 0.5,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
		eyeDropperTrigger: {
			paddingBlock: 0.5,
			paddingInline: 1,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
		area: {
			height: 120,
			borderRadius: "sm",
			overflow: "hidden",
		},
		areaBackground: {
			height: "100%",
		},
		areaThumb: {
			boxSize: "12px",
			borderWidth: "md",
			borderRadius: "full",
		},
		channelSliderTrack: {
			height: "8px",
			borderRadius: "full",
		},
		channelSliderThumb: {
			boxSize: "12px",
			borderWidth: "md",
			borderRadius: "full",
			transform: "translate(-6px, -6px)",
		},
		channelInput: {
			paddingInline: 0.5,
			flex: 1,
			layerStyle: "fill.subtle",
		},
		swatch: {
			boxSize: "1.25em",
			borderRadius: "full",
			boxShadow: "xl",
			outlineWidth: "md",
			outlineStyle: "outset",
			outlineColor: "border.default",
			cursor: "pointer",
		},
		view: hstack.raw({
			minWidth: "200px",
			gap: 0.5,
		}),
		transparencyGrid: {
			backgroundColor: "transparent",
			borderRadius: "full",
		},
	},
	variants: {
		size: {
			sm: {
				root: { fontSize: "12px" },
				label: { fontSize: "0.75rem" },
			},
			md: {
				root: { fontSize: "16px" },
			},
			lg: {
				root: { fontSize: "20px" },
			},
		},
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column-reverse" } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(ColorPicker.RootProvider, "root");
export const Root = withProvider(ColorPicker.Root, "root");
export const AreaBackground = withContext(ColorPicker.AreaBackground, "areaBackground");
export const Area = withContext(ColorPicker.Area, "area");
export const AreaThumb = withContext(ColorPicker.AreaThumb, "areaThumb");
export const ChannelInput = withContext(ColorPicker.ChannelInput, "channelInput");
export const ChannelSliderLabel = withContext(ColorPicker.ChannelSliderLabel, "channelSliderLabel");
export const ChannelSlider = withContext(ColorPicker.ChannelSlider, "channelSlider");
export const ChannelSliderThumb = withContext(ColorPicker.ChannelSliderThumb, "channelSliderThumb");
export const ChannelSliderTrack = withContext(ColorPicker.ChannelSliderTrack, "channelSliderTrack");
export const ChannelSliderValueText = withContext(ColorPicker.ChannelSliderValueText, "channelSliderValueText");
export const Content = withContext(ColorPicker.Content, "content");
export const Control = withContext(ColorPicker.Control, "control");
export const EyeDropperTrigger = withContext(ColorPicker.EyeDropperTrigger, "eyeDropperTrigger");
export const FormatSelect = withContext(ColorPicker.FormatSelect, "formatSelect");
export const FormatTrigger = withContext(ColorPicker.FormatTrigger, "formatTrigger");
export const Label = withContext(ColorPicker.Label, "label");
export const Positioner = withContext(ColorPicker.Positioner, "positioner");
export const SwatchGroup = withContext(ColorPicker.SwatchGroup, "swatchGroup");
export const SwatchIndicator = withContext(ColorPicker.SwatchIndicator, "swatchIndicator");
export const Swatch = withContext(ColorPicker.Swatch, "swatch");
export const SwatchTrigger = withContext(ColorPicker.SwatchTrigger, "swatchTrigger");
export const TransparencyGrid = withContext(ColorPicker.TransparencyGrid, "transparencyGrid");
export const Trigger = withContext(ColorPicker.Trigger, "trigger");
export const ValueSwatch = withContext(ColorPicker.ValueSwatch, "swatch");
export const ValueText = withContext(ColorPicker.ValueText, "valueText");
export const View = withContext(ColorPicker.View, "view");

export { ColorPickerContext as Context, ColorPickerHiddenInput as HiddenInput } from "@ark-ui/react/color-picker";
