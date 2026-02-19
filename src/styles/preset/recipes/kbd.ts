import { defineRecipe } from "@pandacss/dev";

export const kbd = defineRecipe({
	className: "kbd",
	base: {
		display: "inline-flex",
		marginInline: "0.25em",
		marginBottom: "-0.25em",
		paddingBlock: "0.125rem",
		paddingInline: "0.75em",
		lineHeight: "1.25em",
		fontSize: "0.75em",
		textTransform: "uppercase",
		backgroundColor: "bg.muted",
		color: "fg.muted",
		borderWidth: "sm",
		borderBottomWidth: "lg",
		borderColor: "border.muted",
		borderRadius: "sm",
		transform: "translateY(-0.125em)",
	},
});
