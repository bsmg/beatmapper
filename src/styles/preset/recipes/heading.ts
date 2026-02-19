import { defineRecipe } from "@pandacss/dev";

export const heading = defineRecipe({
	className: "heading",
	base: {
		textStyle: "heading",
		color: "fg.muted",
	},
	variants: {
		rank: {
			1: { fontSize: "1.75em" },
			2: { fontSize: "1.5em" },
			3: { fontSize: "1em" },
			4: { fontSize: "0.75em" },
			5: { color: "red.500" },
			6: { color: "red.500" },
		},
	},
});
