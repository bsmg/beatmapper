"use client";
import { Combobox, comboboxAnatomy } from "@ark-ui/react/combobox";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: comboboxAnatomy.keys(),
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Combobox.RootProvider, "root");
export const Root = withProvider(Combobox.Root, "root");
export const ClearTrigger = withContext(Combobox.ClearTrigger, "clearTrigger");
export const Content = withContext(Combobox.Content, "content");
export const Control = withContext(Combobox.Control, "control");
export const Input = withContext(Combobox.Input, "input");
export const ItemGroupLabel = withContext(Combobox.ItemGroupLabel, "itemGroupLabel");
export const ItemGroup = withContext(Combobox.ItemGroup, "itemGroup");
export const ItemIndicator = withContext(Combobox.ItemIndicator, "itemIndicator");
export const Item = withContext(Combobox.Item, "item");
export const ItemText = withContext(Combobox.ItemText, "itemText");
export const Label = withContext(Combobox.Label, "label");
export const List = withContext(Combobox.List, "list");
export const Positioner = withContext(Combobox.Positioner, "positioner");
export const Trigger = withContext(Combobox.Trigger, "trigger");

export { ComboboxContext as Context } from "@ark-ui/react/combobox";

export type { ComboboxHighlightChangeDetails as HighlightChangeDetails, ComboboxInputValueChangeDetails as InputValueChangeDetails, ComboboxOpenChangeDetails as OpenChangeDetails, ComboboxValueChangeDetails as ValueChangeDetails } from "@ark-ui/react/combobox";
