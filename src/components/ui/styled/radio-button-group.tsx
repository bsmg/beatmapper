"use client";
import { RadioGroup, radioGroupAnatomy } from "@ark-ui/react/radio-group";

import { sva } from "$:styled-system/css";
import { wrap } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";

export const recipe = sva({
	slots: [...radioGroupAnatomy.keys()],
	base: {
		root: wrap.raw({
			gap: 1,
		}),
		label: {
			userSelect: "none",
		},
		item: {
			textAlign: "center",
			paddingBlock: 0.5,
			paddingInline: 2,
			fontSize: "14px",
			layerStyle: "outline.subtle",
			borderWidth: "md",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
	variants: {
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column" } },
		},
	},
	defaultVariants: {
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(RadioGroup.Root, "root");
export const Indicator = withContext(RadioGroup.Indicator, "indicator");
export const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
export const Item = withContext(RadioGroup.Item, "item");
export const ItemText = withContext(RadioGroup.ItemText, "itemText");
export const Label = withContext(RadioGroup.Label, "label");

export { RadioGroupContext as Context, RadioGroupItemHiddenInput as ItemHiddenInput } from "@ark-ui/react/radio-group";
