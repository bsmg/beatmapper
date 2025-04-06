"use client";
import { ToggleGroup, toggleGroupAnatomy } from "@ark-ui/react/toggle-group";

import { sva } from "$:styled-system/css";
import { stack } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";

const recipe = sva({
	slots: [...toggleGroupAnatomy.keys()],
	base: {
		root: stack.raw({
			gap: 1,
		}),
		item: {
			padding: 0.5,
			layerStyle: "outline.subtle",
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

export const RootProvider = withProvider(ToggleGroup.RootProvider, "root");
export const Root = withProvider(ToggleGroup.Root, "root");
export const Item = withContext(ToggleGroup.Item, "item");

export { ToggleGroupContext as Context } from "@ark-ui/react/toggle-group";
