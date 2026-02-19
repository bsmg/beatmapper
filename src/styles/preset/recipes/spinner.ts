import { defineRecipe } from "@pandacss/dev";

export const spinner = defineRecipe({
	className: "spinner",
	base: {
		display: "inline-block",
		color: "currentcolor",
		animation: "spin",
	},
});
