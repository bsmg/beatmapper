import { defineRecipe } from "@pandacss/dev";

export const link = defineRecipe({
	className: "link",
	base: {
		textStyle: "link",
		cursor: "pointer",
		color: "fg.default",
	},
});
