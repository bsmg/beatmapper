"use client";

import { RadioGroup, radioGroupAnatomy } from "@ark-ui/react/radio-group";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { center, hstack, wrap } from "$:styled-system/patterns";

const recipe = sva({
	slots: radioGroupAnatomy.keys(),
	base: {
		root: wrap.raw({
			gap: 2,
		}),
		label: {
			userSelect: "none",
		},
		item: hstack.raw({
			color: "fg.default",
			gap: 1,
			opacity: { base: 1, _disabled: "disabled" },
		}),
		itemControl: center.raw({
			boxSize: "1em",
			backgroundColor: "white",
			borderWidth: "sm",
			borderColor: "border.default",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			opacity: { base: 1, _disabled: "disabled" },
			cursor: { base: "pointer", _disabled: "not-allowed" },
		}),
		itemText: {
			userSelect: "none",
			opacity: { base: 1, _disabled: "disabled" },
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
	variants: {
		size: {
			sm: {
				root: { fontSize: "12px" },
				label: { fontSize: "0.75rem" },
			},
			md: {
				root: { fontSize: "16px" },
			},
		},
		orientation: {
			horizontal: { root: { flexDirection: "row", gap: 2 } },
			vertical: { root: { flexDirection: "column", gap: 1.5 } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(RadioGroup.RootProvider, "root");
export const Root = withProvider(RadioGroup.Root, "root");
export const Indicator = withContext(RadioGroup.Indicator, "indicator");
export const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
export const Item = withContext(RadioGroup.Item, "item");
export const ItemText = withContext(RadioGroup.ItemText, "itemText");
export const Label = withContext(RadioGroup.Label, "label");

export { RadioGroupContext as Context, RadioGroupItemHiddenInput as ItemHiddenInput } from "@ark-ui/react/radio-group";
