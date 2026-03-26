"use client";

import { ToggleGroup } from "@ark-ui/react/toggle-group";

import { createStyleContext } from "$:styled-system/jsx";
import { toggleGroup } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toggleGroup);

export const RootProvider = withProvider(ToggleGroup.RootProvider, "root");
export const Root = withProvider(ToggleGroup.Root, "root");
export const Item = withContext(ToggleGroup.Item, "item");

export { ToggleGroupContext as Context } from "@ark-ui/react/toggle-group";
