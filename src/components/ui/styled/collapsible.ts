"use client";

import { Collapsible } from "@ark-ui/react/collapsible";

import { createStyleContext } from "$:styled-system/jsx";
import { collapsible } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(collapsible);

export const Root = withProvider(Collapsible.Root, "root");
export const Trigger = withContext(Collapsible.Trigger, "trigger");
export const Content = withContext(Collapsible.Content, "content");
export const Indicator = withContext(Collapsible.Indicator, "content");

export { CollapsibleContext as Context } from "@ark-ui/react/collapsible";
