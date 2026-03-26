import { defineSlotRecipe } from "@pandacss/dev";

export const table = defineSlotRecipe({
	className: "table",
	jsx: [/Table$/],
	slots: ["root", "body", "cell", "footer", "head", "header", "row", "caption"],
	base: {
		root: {
			width: "100%",
		},
		head: {
			textAlign: "left",
			fontSize: "13px",
			fontWeight: 300,
			color: "fg.muted",
			padding: 1,
		},
		header: {
			borderBottomWidth: { base: "sm" },
			borderColor: { base: "border.default" },
		},
		footer: {
			borderTopWidth: { base: "sm" },
			borderColor: { base: "border.default" },
		},
		row: {
			borderTopWidth: { base: "sm", _first: 0 },
			borderBottomWidth: { base: "sm", _last: 0 },
			borderColor: { base: "border.muted" },
		},
		cell: {
			lineHeight: "tight",
			verticalAlign: "top",
			padding: 1,
		},
	},
});
