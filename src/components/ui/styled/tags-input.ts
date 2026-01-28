"use client";

import { TagsInput } from "@ark-ui/react/tags-input";

import { createStyleContext } from "$:styled-system/jsx";
import { input, tagsInput } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(tagsInput);

export const RootProvider = withProvider(TagsInput.RootProvider, "root");
export const Root = withProvider(TagsInput.Root, "root");
export const ClearTrigger = withContext(TagsInput.ClearTrigger, "clearTrigger");
export const Control = withContext(TagsInput.Control, "control");
export const Input = withContext(TagsInput.Input, "input", {
	defaultProps: { className: input({ size: "md" }) },
});
export const ItemDeleteTrigger = withContext(TagsInput.ItemDeleteTrigger, "itemDeleteTrigger");
export const ItemInput = withContext(TagsInput.ItemInput, "itemInput");
export const ItemPreview = withContext(TagsInput.ItemPreview, "itemPreview");
export const Item = withContext(TagsInput.Item, "item");
export const ItemText = withContext(TagsInput.ItemText, "itemText");
export const Label = withContext(TagsInput.Label, "label");

export { TagsInputContext as Context, TagsInputHiddenInput as HiddenInput } from "@ark-ui/react/tags-input";
