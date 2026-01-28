"use client";

import { RadioGroup } from "@ark-ui/react/radio-group";

import { createStyleContext } from "$:styled-system/jsx";
import { radioGroup } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(radioGroup);

export const RootProvider = withProvider(RadioGroup.RootProvider, "root");
export const Root = withProvider(RadioGroup.Root, "root");
export const Indicator = withContext(RadioGroup.Indicator, "indicator");
export const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
export const Item = withContext(RadioGroup.Item, "item");
export const ItemText = withContext(RadioGroup.ItemText, "itemText");
export const Label = withContext(RadioGroup.Label, "label");

export { RadioGroupContext as Context, RadioGroupItemHiddenInput as ItemHiddenInput } from "@ark-ui/react/radio-group";
