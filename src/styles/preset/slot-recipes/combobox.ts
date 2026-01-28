import { comboboxAnatomy } from "@ark-ui/react/combobox";
import { defineSlotRecipe } from "@pandacss/dev";

export const combobox = defineSlotRecipe({
	className: "combobox",
	slots: comboboxAnatomy.keys(),
});
