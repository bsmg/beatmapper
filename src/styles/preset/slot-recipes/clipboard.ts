import { clipboardAnatomy } from "@ark-ui/react/clipboard";
import { defineSlotRecipe } from "@pandacss/dev";

export const clipboard = defineSlotRecipe({
	className: "clipboard",
	slots: clipboardAnatomy.keys(),
	base: {
		root: {
			position: "relative",
		},
	},
});
