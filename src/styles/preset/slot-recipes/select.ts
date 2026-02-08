import { selectAnatomy } from "@ark-ui/react/select";
import { defineSlotRecipe } from "@pandacss/dev";

export const select = defineSlotRecipe({
	className: "select",
	slots: selectAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 1,
		},
		label: {
			color: "fg.muted",
			pointerEvents: "none",
			whiteSpace: "nowrap",
			userSelect: "none",
			fontSize: "0.875rem",
		},
		control: {
			position: "relative",
			width: "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: { _hover: "bg.ghost" },
			borderRadius: "md",
		},
		trigger: {
			display: "flex",
			alignItems: "center",
			gap: 1,
			paddingInline: 1,
			width: "100%",
			fontSize: "14px",
			userSelect: "none",
			overflow: "hidden",
			cursor: "pointer",
		},
		valueText: {
			flex: 1,
			color: "fg.default",
			position: "relative",
			display: "flex",
			justifyContent: "space-between",
		},
		indicator: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			color: "fg.muted",
			pointerEvents: "none",
		},
		clearTrigger: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			layerStyle: "fill.ghost",
			borderRadius: "sm",
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
				trigger: { height: "24px" },
				clearTrigger: { height: "24px" },
			},
			md: {
				trigger: { height: "iconButton" },
				clearTrigger: { height: "iconButton" },
			},
		},
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column-reverse" } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});
