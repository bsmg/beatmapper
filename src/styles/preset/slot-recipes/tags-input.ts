import { tagsInputAnatomy } from "@ark-ui/react/tags-input";
import { defineSlotRecipe } from "@pandacss/dev";

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
			paddingInline: 0.5,
			fontSize: "12px",
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
