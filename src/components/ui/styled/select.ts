"use client";

import { Select } from "@ark-ui/react/select";

import { createStyleContext } from "$:styled-system/jsx";
import { select } from "$:styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(select);

export const RootProvider = withRootProvider(Select.RootProvider);
export const Root = withRootProvider(Select.Root);
export const ClearTrigger = withContext(Select.ClearTrigger, "clearTrigger");
export const Content = withContext(Select.Content, "content");
export const Control = withContext(Select.Control, "control");
export const Indicator = withContext(Select.Indicator, "indicator");
export const ItemGroupLabel = withContext(Select.ItemGroupLabel, "itemGroupLabel");
export const ItemGroup = withContext(Select.ItemGroup, "itemGroup");
export const ItemIndicator = withContext(Select.ItemIndicator, "itemIndicator");
export const Item = withContext(Select.Item, "item");
export const ItemText = withContext(Select.ItemText, "itemText");
export const Label = withContext(Select.Label, "label");
export const List = withContext(Select.List, "list");
export const Positioner = withContext(Select.Positioner, "positioner");
export const Trigger = withContext(Select.Trigger, "trigger");
export const ValueText = withContext(Select.ValueText, "valueText");

export { SelectContext as Context, SelectHiddenSelect as HiddenSelect } from "@ark-ui/react/select";
