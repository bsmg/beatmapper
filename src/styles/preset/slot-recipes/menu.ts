import { menuAnatomy } from "@ark-ui/react/menu";
import { defineSlotRecipe } from "@pandacss/dev";

export const menu = defineSlotRecipe({
	className: "menu",
	slots: menuAnatomy.keys(),
	base: {
		trigger: {
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		content: {
			layerStyle: "menu.content",
			width: "100%",
			maxHeight: "var(--available-height)",
			zIndex: 1,
			overflowY: "auto",
		},
		item: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 1,
			padding: 1,
			colorPalette: "blue",
			layerStyle: "menu.item",
			userSelect: "none",
		},
	},
});
