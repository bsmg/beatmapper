import { checkboxAnatomy } from "@ark-ui/react/checkbox";
import { defineSlotRecipe } from "@pandacss/dev";

export const checkbox = defineSlotRecipe({
	className: "checkbox",
	slots: checkboxAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			alignItems: "center",
			gap: 1,
		},
		label: {
			display: "flex",
			flexWrap: "wrap",
			align: "center",
			gap: 0,
			userSelect: "none",
		},
		control: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			boxSize: "1.125em",
			borderRadius: "sm",
			backgroundColor: "white",
			borderWidth: "sm",
			borderColor: "border.default",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: "pointer",
		},
		indicator: {
			color: "black",
			_icon: { boxSize: "1em" },
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
