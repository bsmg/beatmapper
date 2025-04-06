"use client";
import { TagsInput, tagsInputAnatomy } from "@ark-ui/react/tags-input";

import { sva } from "$:styled-system/css";
import { hstack, stack, wrap } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";
import { recipe as inputRecipe } from "./input";

const recipe = sva({
	slots: tagsInputAnatomy.keys(),
	base: {
		root: stack.raw({
			gap: 1,
		}),
		label: {
			userSelect: "none",
		},
		control: wrap.raw({
			...inputRecipe.raw(),
			columnGap: 1,
			align: "center",
		}),
		input: {
			width: 0,
			minWidth: "48px",
			marginBlock: 0.5,
			flex: 1,
			color: { _placeholder: "fg.muted" },
			outline: "none",
			userSelect: "none",
		},
		item: hstack.raw({
			width: "fit-content",
			marginBlock: 0.5,
			fontSize: "14px",
			colorPalette: "slate",
		}),
		itemPreview: hstack.raw({
			paddingInlineStart: 1,
			layerStyle: "fill.subtle",
			backgroundColor: { _highlighted: "bg.muted" },
			borderRadius: "md",
		}),
		itemInput: {
			paddingInline: 1,
			layerStyle: "fill.subtle",
			borderRadius: "md",
		},
		itemDeleteTrigger: {
			paddingInline: 0.5,
			fontSize: "12px",
			layerStyle: "fill.ghost",
			borderRadius: "md",
			cursor: "pointer",
		},
		clearTrigger: {
			padding: 0.5,
			marginBlock: 0.5,
			colorPalette: "red",
			layerStyle: "fill.ghost",
			borderRadius: "md",
			cursor: "pointer",
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(TagsInput.RootProvider, "root");
export const Root = withProvider(TagsInput.Root, "root");
export const ClearTrigger = withContext(TagsInput.ClearTrigger, "clearTrigger");
export const Control = withContext(TagsInput.Control, "control");
export const Input = withContext(TagsInput.Input, "input");
export const ItemDeleteTrigger = withContext(TagsInput.ItemDeleteTrigger, "itemDeleteTrigger");
export const ItemInput = withContext(TagsInput.ItemInput, "itemInput");
export const ItemPreview = withContext(TagsInput.ItemPreview, "itemPreview");
export const Item = withContext(TagsInput.Item, "item");
export const ItemText = withContext(TagsInput.ItemText, "itemText");
export const Label = withContext(TagsInput.Label, "label");

export { TagsInputContext as Context, TagsInputHiddenInput as HiddenInput } from "@ark-ui/react/tags-input";
