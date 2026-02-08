import { sliderAnatomy } from "@ark-ui/react/slider";
import { defineSlotRecipe } from "@pandacss/dev";

export const slider = defineSlotRecipe({
	className: "slider",
	slots: sliderAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			alignItems: "center",
			gap: 1,
		},
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
		},
		markerGroup: {
			flex: 1,
		},
		marker: {
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
		},
	},
	variants: {
		size: {
			sm: {
				root: { height: "16px" },
				label: { fontSize: "0.75rem" },
				control: { height: "12px", marginInline: "6px" },
				track: { height: "2px", marginBlockStart: "5px" },
				range: { height: "2px" },
				thumb: { boxSize: "12px", marginBlockStart: "-7px" },
				markerGroup: { marginBlockStart: "-5px" },
				marker: { _before: { height: "8px" } },
			},
			md: {
				root: { height: "20px" },
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
		stretch: {
			true: {
				root: { width: "100%" },
				control: { width: "100%" },
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
