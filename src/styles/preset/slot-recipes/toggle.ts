import { toggleAnatomy } from "@ark-ui/react/toggle";
import { defineSlotRecipe } from "@pandacss/dev";

export const toggle = defineSlotRecipe({
	className: "toggle",
	slots: toggleAnatomy.keys(),
	base: {
		root: {
			width: "fit-content",
			padding: 0.5,
			layerStyle: "outline.subtle",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
});
