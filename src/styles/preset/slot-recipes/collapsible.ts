import { collapsibleAnatomy } from "@ark-ui/react/collapsible";
import { defineSlotRecipe } from "@pandacss/dev";

export const collapsible = defineSlotRecipe({
	className: "collapsible",
	slots: collapsibleAnatomy.keys(),
	base: {
		content: {
			paddingBlockStart: 2,
		},
	},
});
