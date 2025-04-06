"use client";
import { Switch, switchAnatomy } from "@ark-ui/react/switch";

import { sva } from "$:styled-system/css";
import { hstack, stack } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";

const recipe = sva({
	slots: switchAnatomy.keys(),
	base: {
		root: stack.raw({
			align: "center",
			gap: 1,
		}),
		label: {
			userSelect: "none",
		},
		control: hstack.raw({
			justify: { base: "start", _checked: "end" },
			borderWidth: "sm",
			borderColor: "border.default",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: "pointer",
		}),
		thumb: {
			backgroundColor: "white",
			borderWidth: "md",
			borderColor: "border.muted",
			borderRadius: "full",
		},
	},
	variants: {
		size: {
			sm: {
				label: { fontSize: "0.75rem" },
				control: { width: "28px", height: "16px" },
				thumb: { marginInline: "2px", boxSize: "12px" },
			},
			md: {
				control: { width: "36px", height: "20px" },
				thumb: { marginInline: "2px", boxSize: "16px" },
			},
		},
		orientation: {
			horizontal: {
				root: { flexDirection: "row" },
			},
			vertical: {
				root: { flexDirection: "column-reverse" },
			},
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Switch.RootProvider, "root");
export const Root = withProvider(Switch.Root, "root");
export const Control = withContext(Switch.Control, "control");
export const Label = withContext(Switch.Label, "label");
export const Thumb = withContext(Switch.Thumb, "thumb");

export { SwitchContext as Context, SwitchHiddenInput as HiddenInput } from "@ark-ui/react/switch";
