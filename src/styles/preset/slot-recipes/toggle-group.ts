import { toggleGroupAnatomy } from "@ark-ui/react/toggle-group";
import { defineSlotRecipe } from "@pandacss/dev";

export const toggleGroup = defineSlotRecipe({
	className: "toggle-group",
	slots: toggleGroupAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			gap: 1,
		},
		item: {
			padding: 0.5,
			layerStyle: "outline.subtle",
			userSelect: "none",
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
