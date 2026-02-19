import { defineRecipe } from "@pandacss/dev";

export const link = defineRecipe({
	className: "link",
	base: {
		textStyle: "link",
		colorPalette: "yellow",
		cursor: "pointer",
	},
});
