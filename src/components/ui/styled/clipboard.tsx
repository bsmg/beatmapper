"use client";

import { Clipboard, clipboardAnatomy } from "@ark-ui/react/clipboard";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";

const recipe = sva({
	slots: [...clipboardAnatomy.keys()],
	base: {
		root: {
			position: "relative",
		},
		trigger: {
			position: "absolute",
			top: 1.5,
			right: 1.5,
			padding: 1,
			colorPalette: "red",
			layerStyle: "fill.subtle",
			borderRadius: "md",
			cursor: "pointer",
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Clipboard.RootProvider, "root");
export const Root = withProvider(Clipboard.Root, "root");
export const Control = withContext(Clipboard.Control, "control");
export const Trigger = withContext(Clipboard.Trigger, "trigger");
export const Indicator = withContext(Clipboard.Indicator, "indicator");
export const Input = withContext(Clipboard.Input, "input");
export const Label = withContext(Clipboard.Label, "label");

export { ClipboardContext as Context } from "@ark-ui/react/clipboard";
