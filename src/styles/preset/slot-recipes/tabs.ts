import { tabsAnatomy } from "@ark-ui/react/tabs";
import { defineSlotRecipe } from "@pandacss/dev";

export const tabs = defineSlotRecipe({
	className: "tabs",
	slots: tabsAnatomy.keys(),
	base: {
		root: {
			width: "100%",
		},
		list: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 1,
			paddingInline: 0.25,
			paddingBlock: 0.5,
			overflowX: "auto",
			whiteSpace: "nowrap",
		},
		content: {
			marginBlock: 2,
		},
		trigger: {
			flex: 1,
			paddingBlock: 1,
			paddingInline: 2,
			layerStyle: "fill.ghost",
			borderBottomWidth: "md",
			borderColor: { base: "border.default", _selected: "colorPalette.500" },
			borderTopRadius: "md",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
});
