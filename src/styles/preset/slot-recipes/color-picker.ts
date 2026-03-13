import { colorPickerAnatomy } from "@ark-ui/react/color-picker";
import { defineSlotRecipe } from "@pandacss/dev";

import { input } from "../recipes";

export const colorPicker = defineSlotRecipe({
	className: "color-picker",
	slots: colorPickerAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			gap: 1,
		},
		label: {
			userSelect: "none",
		},
		content: {
			minWidth: "200px",
			display: "flex",
			flexDirection: "column",
			gap: 1,
			padding: 1,
			fontSize: "14px",
			colorPalette: "slate",
			layerStyle: "fill.surface",
			animationStyle: { _open: "slide-fade-in", _closed: "slide-fade-out" },
			zIndex: 3,
		},
		formatTrigger: {
			flex: 1,
			paddingBlock: 0.5,
			paddingInline: 1,
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
			...input.base,
			...input.variants?.size?.md,
			colorPalette: "pink",
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
		view: {
			display: "flex",
			flexDirection: "column",
			gap: 1.5,
		},
		transparencyGrid: {
			backgroundColor: "transparent",
			borderRadius: "full",
		},
	},
	variants: {
		size: {
			sm: {
				root: { fontSize: "12px" },
				label: { fontSize: "0.75em" },
			},
			md: {
				root: { fontSize: "16px" },
				label: { fontSize: "0.75em" },
			},
			lg: {
				root: { fontSize: "20px" },
				label: { fontSize: "0.75em" },
			},
		},
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column-reverse", alignItems: "center" } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});
