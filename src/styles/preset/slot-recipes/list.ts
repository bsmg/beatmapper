import { defineSlotRecipe } from "@pandacss/dev";

export const list = defineSlotRecipe({
	className: "list",
	jsx: [/List$/],
	slots: ["root", "item", "indicator"],
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			marginBlock: 1.5,
			gap: 1,
			"& :where(ul, ol)": { marginTop: 1 },
		},
		item: {
			lineHeight: 1.5,
			color: "fg.default",
			listStylePosition: "inside",
			_marker: { margin: 0 },
		},
		indicator: {
			flexShrink: 0,
			display: "inline-block",
			verticalAlign: "middle",
			color: "colorPalette.500",
		},
	},
	variants: {
		variant: {
			marker: {
				root: {
					listStyle: "revert",
				},
				item: {
					_marker: { color: "colorPalette.500" },
				},
				indicator: { marginInlineEnd: 2 },
			},
			plain: {
				item: {
					display: "flex",
					flexDirection: "row",
					gap: 2,
				},
			},
		},
	},
	defaultVariants: {
		variant: "marker",
	},
});
