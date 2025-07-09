"use client";
import { Menu, menuAnatomy } from "@ark-ui/react/menu";

import { sva } from "$:styled-system/css";
import { hstack } from "$:styled-system/patterns";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: menuAnatomy.keys(),
	base: {
		trigger: {
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		content: {
			layerStyle: "menu.content",
			width: "100%",
			maxHeight: "var(--available-height)",
			zIndex: 1,
			overflowY: "auto",
		},
		item: hstack.raw({
			padding: 1,
			justifyContent: "space-between",
			colorPalette: "blue",
			layerStyle: "menu.item",
			userSelect: "none",
		}),
	},
});

const { withRootProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withRootProvider(Menu.RootProvider);
export const Root = withRootProvider(Menu.Root);
export const Arrow = withContext(Menu.Arrow, "arrow");
export const ArrowTip = withContext(Menu.ArrowTip, "arrowTip");
export const CheckboxItem = withContext(Menu.CheckboxItem, "item");
export const Content = withContext(Menu.Content, "content");
export const ContextTrigger = withContext(Menu.ContextTrigger, "contextTrigger");
export const Indicator = withContext(Menu.Indicator, "indicator");
export const ItemGroupLabel = withContext(Menu.ItemGroupLabel, "itemGroupLabel");
export const ItemGroup = withContext(Menu.ItemGroup, "itemGroup");
export const ItemIndicator = withContext(Menu.ItemIndicator, "itemIndicator");
export const Item = withContext(Menu.Item, "item");
export const ItemText = withContext(Menu.ItemText, "itemText");
export const Positioner = withContext(Menu.Positioner, "positioner");
export const RadioItemGroup = withContext(Menu.RadioItemGroup, "itemGroup");
export const RadioItem = withContext(Menu.RadioItem, "item");
export const Separator = withContext(Menu.Separator, "separator");
export const TriggerItem = withContext(Menu.TriggerItem, "triggerItem");
export const Trigger = withContext(Menu.Trigger, "trigger");

export { MenuContext as Context } from "@ark-ui/react/menu";
