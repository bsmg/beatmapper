import { tagsInputAnatomy } from "@ark-ui/react/tags-input";
import { defineSlotRecipe } from "@pandacss/dev";

import { input } from "../recipes";

export const tagsInput = defineSlotRecipe({
	className: "tags-input",
	slots: tagsInputAnatomy.keys(),
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
		item: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			width: "fit-content",
			marginBlock: 0.5,
			fontSize: "14px",
			colorPalette: "slate",
		},
		itemPreview: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			paddingInlineStart: 1,
			layerStyle: "fill.subtle",
			backgroundColor: { _highlighted: "bg.muted" },
			borderRadius: "md",
		},
		itemInput: {
			paddingInline: 1,
			layerStyle: "fill.subtle",
			borderRadius: "md",
		},
		itemDeleteTrigger: {
			padding: 0.5,
			marginInlineStart: 1,
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
	},
});
