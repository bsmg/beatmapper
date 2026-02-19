"use client";

import { Tooltip } from "@ark-ui/react/tooltip";

import { createStyleContext } from "$:styled-system/jsx";
import { tooltip } from "$:styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(tooltip);

export const RootProvider = withRootProvider(Tooltip.RootProvider);
export const Root = withRootProvider(Tooltip.Root);
export const Arrow = withContext(Tooltip.Arrow, "arrow");
export const ArrowTip = withContext(Tooltip.ArrowTip, "arrowTip");
export const Content = withContext(Tooltip.Content, "content");
export const Positioner = withContext(Tooltip.Positioner, "positioner");
export const Trigger = withContext(Tooltip.Trigger, "trigger");

export { TooltipContext as Context } from "@ark-ui/react/tooltip";
