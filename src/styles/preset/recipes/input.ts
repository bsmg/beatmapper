import { defineRecipe } from "@pandacss/dev";

export const input = defineRecipe({
	className: "input",
	base: {
		width: "100%",
		lineHeight: 1.5,
		padding: 0,
		marginBlockStart: -1,
		color: { _placeholder: "fg.muted" },
		borderBottomWidth: "md",
		borderColor: { base: "border.default", _focus: "colorPalette.500", _invalid: "fg.error" },
		outline: "none",
		opacity: { base: 1, _disabled: "disabled" },
	},
	variants: {
		size: {
			md: { minHeight: "36px" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});
