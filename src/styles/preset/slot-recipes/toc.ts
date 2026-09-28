import { tocAnatomy } from "@ark-ui/react/toc";
import { defineSlotRecipe } from "@pandacss/dev";

export const toc = defineSlotRecipe({
	className: "toc",
	jsx: [/Prose$/],
	slots: tocAnatomy.extendWith("nav", "actions").keys(),
	base: {
		root: {
			position: "relative",
			display: "flex",
			alignItems: "start",
			gap: { base: 4, xl: 8 },
			flex: 1,
			flexDirection: { base: "column-reverse", xl: "row" },
		},
		nav: {
			position: { base: "static", xl: "sticky" },
			top: { base: 4 },
			width: "100%",
			maxHeight: { xl: "calc(100vh - 4rem)" },
			overflowY: { xl: "auto" },
			display: "flex",
			flexDirection: "column",
			flexBasis: { base: "auto", xl: "220px" },
			minWidth: { xl: "220px" },
		},
		list: {
			gap: 0,
			width: "100%",
			display: "flex",
			flexDirection: "column",
			lineHeight: 1.4,
		},
		title: {
			borderBottomWidth: "sm",
			borderColor: "border.default",
			paddingBottom: 1,
			marginBottom: 1,
			fontWeight: "bold",
		},
		item: {
			textStyle: "link",
			colorPalette: "pink",
			paddingBlock: 1,
		},
		actions: {
			borderTopWidth: "sm",
			borderColor: "border.default",
			paddingTop: 1,
			marginTop: 1,
			fontWeight: "bold",
		},
	},
});
