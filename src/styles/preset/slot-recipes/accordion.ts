import { accordionAnatomy } from "@ark-ui/react/accordion";
import { defineSlotRecipe } from "@pandacss/dev";

export const accordion = defineSlotRecipe({
	className: "accordion",
	slots: accordionAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			gap: 1,
		},
		item: {
			width: "100%",
		},
		itemTrigger: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingInline: "12px",
			marginInlineEnd: 2,
			width: "100%",
			height: "40px",
			fontFamily: "body",
			fontSize: "15px",
			fontWeight: 400,
			textTransform: "uppercase",
			borderRadius: "sm",
			layerStyle: "fill.ghost",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		itemContent: {
			marginBlock: 0.5,
		},
		itemIndicator: {
			transform: { _open: "rotate(180deg)" },
		},
	},
});
