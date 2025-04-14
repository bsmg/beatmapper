"use client";
import { Slider, sliderAnatomy } from "@ark-ui/react/slider";

import { sva } from "$:styled-system/css";
import { stack } from "$:styled-system/patterns";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: sliderAnatomy.keys(),
	base: {
		root: stack.raw({
			align: "center",
			gap: 1,
		}),
		label: {
			userSelect: "none",
		},
		control: {
			cursor: "pointer",
		},
		track: {
			backgroundColor: "border.default",
			borderRadius: "full",
			overflow: "hidden",
			flex: 1,
		},
		thumb: {
			backgroundColor: "white",
			borderWidth: "md",
			borderColor: "border.muted",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: "pointer",
			zIndex: 1,
		},
		markerGroup: {
			flex: 1,
		},
		marker: stack.raw({
			gap: 0.5,
			marginInline: "-1px",
			fontSize: "12px",
			color: "fg.muted",
			_before: {
				content: "''",
				display: "block",
				position: "relative",
				left: "50%",
				width: "1px",
				backgroundColor: "border.default",
				borderRadius: "full",
				transform: "translateX(-50%)",
			},
		}),
	},
	variants: {
		size: {
			sm: {
				label: { fontSize: "0.75rem" },
				control: { height: "12px", marginInline: "6px" },
				range: { height: "2px" },
				track: { height: "2px", marginBlockStart: "5px" },
				thumb: { boxSize: "12px", marginBlockStart: "-7px" },
				markerGroup: { marginBlockStart: "-5px" },
				marker: { _before: { height: "8px" } },
			},
			md: {
				control: { height: "16px", marginInline: "8px" },
				range: { height: "4px" },
				track: { height: "4px", marginBlockStart: "6px" },
				thumb: { boxSize: "16px", marginBlockStart: "-10px" },
				markerGroup: { marginBlockStart: "-8px" },
				marker: { _before: { height: "12px" } },
			},
		},
		orientation: {
			horizontal: {
				root: { flexDirection: "row" },
			},
			vertical: {
				root: { flexDirection: "column-reverse" },
			},
		},
	},
	compoundVariants: [
		{ orientation: "horizontal", size: "sm", css: { control: { minWidth: "50px" } } },
		{ orientation: "horizontal", size: "md", css: { control: { minWidth: "100px" } } },
	],
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Slider.RootProvider, "root");
export const Root = withProvider(Slider.Root, "root");
export const Control = withContext(Slider.Control, "control");
export const Label = withContext(Slider.Label, "label");
export const MarkerGroup = withContext(Slider.MarkerGroup, "markerGroup");
export const Marker = withContext(Slider.Marker, "marker");
export const Range = withContext(Slider.Range, "range");
export const Thumb = withContext(Slider.Thumb, "thumb");
export const Track = withContext(Slider.Track, "track");
export const ValueText = withContext(Slider.ValueText, "valueText");

export { SliderContext as Context, SliderHiddenInput as HiddenInput } from "@ark-ui/react/slider";
