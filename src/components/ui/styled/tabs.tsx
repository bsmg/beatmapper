"use client";
import { Tabs, tabsAnatomy } from "@ark-ui/react/tabs";

import { sva } from "$:styled-system/css";
import { hstack } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";

const recipe = sva({
	slots: tabsAnatomy.keys(),
	base: {
		root: {
			width: "100%",
		},
		list: hstack.raw({
			paddingBlock: 0.5,
			overflowX: "auto",
		}),
		content: {
			marginBlock: 2,
		},
		trigger: {
			flex: 1,
			paddingBlock: 1,
			paddingInline: 2,
			layerStyle: "fill.ghost",
			borderBottomWidth: "md",
			borderColor: { base: "border.default", _selected: "colorPalette.500" },
			borderTopRadius: "md",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Tabs.RootProvider, "root");
export const Root = withProvider(Tabs.Root, "root");
export const Content = withContext(Tabs.Content, "content");
export const Indicator = withContext(Tabs.Indicator, "indicator");
export const List = withContext(Tabs.List, "list");
export const Trigger = withContext(Tabs.Trigger, "trigger");

export { TabsContext as Context } from "@ark-ui/react/tabs";
