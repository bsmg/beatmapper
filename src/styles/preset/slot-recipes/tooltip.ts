import { tooltipAnatomy } from "@ark-ui/react/tooltip";
import { defineSlotRecipe } from "@pandacss/dev";

export const tooltip = defineSlotRecipe({
	className: "tooltip",
	slots: tooltipAnatomy.keys(),
	base: {
		content: {
			maxWidth: "200px",
			paddingBlock: 0.5,
			paddingInline: 1,
			fontSize: "1rem",
			fontWeight: 300,
			lineHeight: 1.25,
			letterSpacing: "normal",
			whiteSpace: "wrap",
			textAlign: "center",
			textTransform: "none",
			colorPalette: "slate",
			layerStyle: "fill.surface",
			backgroundColor: "bg.canvas",
			borderRadius: "sm",
			boxShadow: "xl",
			animationStyle: { _open: "fade-in", _closed: "fade-out" },
			userSelect: "none",
			zIndex: 3,
		},
	},
});
