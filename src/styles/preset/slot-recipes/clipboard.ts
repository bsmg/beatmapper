import { clipboardAnatomy } from "@ark-ui/react/clipboard";
import { defineSlotRecipe } from "@pandacss/dev";

export const clipboard = defineSlotRecipe({
	className: "clipboard",
	slots: clipboardAnatomy.keys(),
	base: {
		root: {
			position: "relative",
		},
		trigger: {
			position: "absolute",
			top: 1.5,
			right: 1.5,
			padding: 1,
			colorPalette: "red",
			layerStyle: "fill.subtle",
			borderRadius: "md",
			cursor: "pointer",
		},
	},
});
