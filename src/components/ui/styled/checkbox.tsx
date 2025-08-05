"use client";

import { Checkbox, checkboxAnatomy } from "@ark-ui/react/checkbox";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { center, stack, wrap } from "$:styled-system/patterns";

export const recipe = sva({
	className: "checkbox",
	slots: checkboxAnatomy.keys(),
	base: {
		root: stack.raw({
			align: "center",
			gap: 1,
		}),
		label: wrap.raw({
			align: "center",
			gap: 0,
			userSelect: "none",
		}),
		control: center.raw({
			boxSize: "1.125em",
			borderRadius: "sm",
			backgroundColor: "white",
			borderWidth: "sm",
			borderColor: "border.default",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: "pointer",
		}),
		indicator: {
			color: "black",
			_icon: { boxSize: "1em" },
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
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column-reverse" } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Checkbox.RootProvider, "root");
export const Root = withProvider(Checkbox.Root, "root");
export const Control = withContext(Checkbox.Control, "control");
export const Group = withContext(Checkbox.Group, "group");
export const Indicator = withContext(Checkbox.Indicator, "indicator");
export const Label = withContext(Checkbox.Label, "label");

export { CheckboxContext as Context, CheckboxHiddenInput as HiddenInput } from "@ark-ui/react/checkbox";
