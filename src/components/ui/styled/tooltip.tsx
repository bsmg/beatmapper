"use client";
import { Tooltip, tooltipAnatomy } from "@ark-ui/react/tooltip";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "../../utils/create-style-context";

const recipe = sva({
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

const { withRootProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withRootProvider(Tooltip.RootProvider);
export const Root = withRootProvider(Tooltip.Root);
export const Arrow = withContext(Tooltip.Arrow, "arrow");
export const ArrowTip = withContext(Tooltip.ArrowTip, "arrowTip");
export const Content = withContext(Tooltip.Content, "content");
export const Positioner = withContext(Tooltip.Positioner, "positioner");
export const Trigger = withContext(Tooltip.Trigger, "trigger");

export { TooltipContext as Context } from "@ark-ui/react/tooltip";
