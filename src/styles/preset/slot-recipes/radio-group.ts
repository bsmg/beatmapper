import { radioGroupAnatomy } from "@ark-ui/react/radio-group";
import { defineSlotRecipe } from "@pandacss/dev";

export const radioGroup = defineSlotRecipe({
	className: "radio-group",
	slots: radioGroupAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flexWrap: "wrap",
			gap: 2,
		},
		label: {
			userSelect: "none",
		},
		item: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 1,
			color: "fg.default",
			opacity: { base: 1, _disabled: "disabled" },
		},
		itemControl: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			boxSize: "1em",
			backgroundColor: { base: "white", _checked: "black" },
			color: "white",
			borderWidth: "sm",
			borderColor: "border.default",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		itemText: {
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
	variants: {
		size: {
			sm: {
				root: { fontSize: "12px" },
				label: { fontSize: "0.75rem" },
				itemControl: { boxShadow: "inset 0 0 0 1px" },
			},
			md: {
				root: { fontSize: "16px" },
				itemControl: { boxShadow: "inset 0 0 0 3px" },
			},
		},
		orientation: {
			horizontal: { root: { flexDirection: "row", gap: 2 } },
			vertical: { root: { flexDirection: "column", gap: 1.5 } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});
