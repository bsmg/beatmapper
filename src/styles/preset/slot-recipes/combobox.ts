import { comboboxAnatomy } from "@ark-ui/react/combobox";
import { defineSlotRecipe } from "@pandacss/dev";

import { input } from "../recipes";

export const combobox = defineSlotRecipe({
	className: "combobox",
	slots: comboboxAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			gap: 1,
		},
		label: {
			userSelect: "none",
		},
		control: {
			...input.base,
			...input.variants?.size?.md,
			display: "flex",
			flex: 1,
			flexWrap: "wrap",
			columnGap: 1,
			align: "center",
		},
		input: {
			width: 0,
			minWidth: "48px",
			flex: 1,
			color: { _placeholder: "fg.muted" },
			outline: "none",
			userSelect: "none",
		},
		trigger: {
			padding: 0.5,
			marginBlock: 0.5,
			colorPalette: "slate",
			layerStyle: "fill.ghost",
			borderRadius: "md",
			cursor: "pointer",
		},
		clearTrigger: {
			padding: 0.5,
			marginBlock: 0.5,
			colorPalette: "red",
			layerStyle: "fill.ghost",
			borderRadius: "md",
			cursor: "pointer",
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
		itemText: {
			display: "flex",
			flexDirection: "row",
			alignItems: "baseline",
			gap: 0.5,
		},
	},
});
