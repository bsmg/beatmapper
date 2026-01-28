import { radioGroupAnatomy } from "@ark-ui/react/radio-group";
import { defineSlotRecipe } from "@pandacss/dev";

export const radioButtonGroup = defineSlotRecipe({
	className: "radio-button-group",
	slots: radioGroupAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flexWrap: "wrap",
			gap: 1,
		},
		label: {
			userSelect: "none",
		},
		item: {
			textAlign: "center",
			paddingBlock: 0.5,
			paddingInline: 2,
			fontSize: "14px",
			borderWidth: "md",
			borderColor: { base: "border.muted", _checked: "var(--current-color)", _pressed: "var(--current-color)", _disabled: "border.disabled" },
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			userSelect: "none",
			opacity: { base: 1, _disabled: "disabled" },
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
	variants: {
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column" } },
		},
	},
	defaultVariants: {
		orientation: "horizontal",
	},
});
