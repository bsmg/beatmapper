import { dialogAnatomy } from "@ark-ui/react/dialog";
import { defineSlotRecipe } from "@pandacss/dev";

export const dialog = defineSlotRecipe({
	className: "dialog",
	slots: dialogAnatomy.keys(),
	base: {
		trigger: {
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		backdrop: {
			position: "fixed",
			left: 0,
			top: 0,
			width: "100vw",
			height: "100dvh",
			backdropFilter: "blur(8px)",
			backgroundColor: "bg.backdrop",
			animationStyle: { _open: "fade-in", _closed: "fade-out" },
		},
		positioner: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			position: "fixed",
			left: 0,
			top: 0,
			width: "100vw",
			height: "100dvh",
		},
		content: {
			display: "flex",
			flexDirection: "column",
			gap: 2,
			position: "relative",
			margin: 4,
			padding: 4,
			maxWidth: "100vw",
			maxHeight: "calc(100vh - {spacing.8})",
			overflowY: "auto",
			wordWrap: "break-word",
			colorPalette: "slate",
			layerStyle: "fill.surface",
			animationStyle: { _open: "slide-fade-in", _closed: "slide-fade-out" },
			zIndex: 5,
		},
		title: {
			textStyle: "heading",
			color: "fg.muted",
			fontSize: "1.75em",
		},
		description: {
			textStyle: "paragraph",
			fontSize: "0.9375rem",
		},
		closeTrigger: {
			position: "absolute",
			top: 3,
			right: 3,
			padding: 1,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
	},
	variants: {
		size: {
			sm: { content: { width: "400px" } },
			md: { content: { width: "600px" } },
			lg: { content: { width: "800px" } },
		},
		placement: {
			top: { positioner: { alignItems: "flex-start" } },
			middle: { positioner: { alignItems: "center" } },
			bottom: { positioner: { alignItems: "flex-end" } },
		},
		justify: {
			start: { positioner: { justifyContent: "flex-start" } },
			middle: { positioner: { justifyContent: "center" } },
			end: { positioner: { justifyContent: "flex-end" } },
		},
	},
	defaultVariants: {
		size: "md",
		placement: "middle",
		justify: "middle",
	},
});
