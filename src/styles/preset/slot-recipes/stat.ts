import { defineSlotRecipe } from "@pandacss/dev";

export const stat = defineSlotRecipe({
	className: "stat",
	slots: ["root", "label", "valueText"],
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 0,
		},
		label: {
			textStyle: "heading",
			color: "fg.muted",
		},
		valueText: {
			textStyle: "paragraph",
			fontFamily: "monospace",
			color: "fg.default",
		},
	},
	variants: {
		size: {
			sm: { label: { fontSize: "0.75rem" } },
			md: { label: { fontSize: "1rem" } },
		},
	},
	defaultVariants: {
		size: "sm",
	},
});
