"use client";

import { Toggle } from "@ark-ui/react/toggle";

import { createStyleContext } from "$:styled-system/jsx";
import { toggle } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toggle);

export const Root = withProvider(Toggle.Root, "root");
export const Indicator = withContext(Toggle.Indicator, "indicator");

export { ToggleContext as Context } from "@ark-ui/react/toggle";
