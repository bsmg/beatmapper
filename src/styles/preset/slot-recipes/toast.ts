import { toastAnatomy } from "@ark-ui/react/toast";
import { defineSlotRecipe } from "@pandacss/dev";

export const toast = defineSlotRecipe({
	className: "toast",
	jsx: [/Toast$/, /Toaster$/],
	slots: toastAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			gap: 1,
			position: "relative",
			width: "400px",
			padding: 2,
			textStyle: "paragraph",
			wordWrap: "break-word",
			colorPalette: {
				base: "slate",
				'&[data-type="success"]': "green",
				'&[data-type="error"]': "red",
				'&[data-type="info"]': "blue",
			},
			layerStyle: "fill.surface",
			scale: "var(--scale)",
			translate: "var(--x) var(--y) 0",
			willChange: "translate, opacity, scale",
			zIndex: "var(--z-index)",
			transitionDuration: "fast",
			transitionProperty: "translate, scale, opacity, height",
			transitionTimingFunction: "default",
			"& > *:nth-child(2)": { marginRight: 6 },
		},
		closeTrigger: {
			position: "absolute",
			top: 1,
			right: 1,
			padding: 1,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
	},
});
