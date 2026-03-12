import { defineRecipe } from "@pandacss/dev";

export const link = defineRecipe({
	className: "link",
	base: {
		textStyle: "link",
		colorPalette: {
			"&[target]": "yellow",
		},
		cursor: "pointer",
	},
});
