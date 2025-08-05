"use client";

import { Toggle, toggleAnatomy } from "@ark-ui/react/toggle";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";

const recipe = sva({
	slots: [...toggleAnatomy.keys()],
	base: {
		root: {
			width: "fit-content",
			padding: 0.5,
			layerStyle: "outline.subtle",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(Toggle.Root, "root");
export const Indicator = withContext(Toggle.Indicator, "indicator");

export { ToggleContext as Context } from "@ark-ui/react/toggle";
