import { selectAnatomy } from "@ark-ui/react/select";
import { defineSlotRecipe } from "@pandacss/dev";

export const select = defineSlotRecipe({
	className: "select",
	slots: selectAnatomy.keys(),
	base: {
		trigger: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 2,
			width: "100%",
			backgroundColor: { _hover: "bg.ghost" },
			paddingInline: 1,
			borderRadius: "md",
			fontSize: "14px",
			userSelect: "none",
			overflow: "hidden",
			cursor: "pointer",
		},
		label: {
			color: "fg.muted",
			pointerEvents: "none",
			userSelect: "none",
		},
		indicator: {
			color: "fg.muted",
		},
		valueText: {
			flex: 1,
			color: "fg.default",
			position: "relative",
			display: "flex",
			justifyContent: "space-between",
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
	variants: {
		size: {
			sm: {
				trigger: {
					height: "24px",
				},
			},
			md: {
				trigger: {
					height: "iconButton",
				},
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});
