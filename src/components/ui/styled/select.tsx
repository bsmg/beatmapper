"use client";
import { Select, selectAnatomy } from "@ark-ui/react/select";

import { sva } from "$:styled-system/css";
import { hstack } from "$:styled-system/patterns";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: selectAnatomy.keys(),
	base: {
		trigger: hstack.raw({
			width: "100%",
			gap: 2,
			backgroundColor: { _hover: "bg.ghost" },
			paddingInline: 1,
			borderRadius: "md",
			fontSize: "14px",
			userSelect: "none",
			overflow: "hidden",
			cursor: "pointer",
		}),
		label: {
			color: "fg.muted",
			pointerEvents: "none",
			userSelect: "none",
		},
		indicator: {
			color: "fg.muted",
		},
		valueText: {
			flex: 1,
			color: "fg.default",
			position: "relative",
			display: "flex",
			justifyContent: "space-between",
		},
		content: {
			layerStyle: "menu.content",
			width: "100%",
			zIndex: 1,
		},
		item: hstack.raw({
			padding: 1,
			justifyContent: "space-between",
			colorPalette: "blue",
			layerStyle: "menu.item",
			userSelect: "none",
		}),
	},
	variants: {
		size: {
			sm: {
				trigger: {
					height: "24px",
				},
			},
			md: {
				trigger: {
					height: "iconButton",
				},
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const { withRootProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withRootProvider(Select.RootProvider);
export const Root = withRootProvider(Select.Root);
export const ClearTrigger = withContext(Select.ClearTrigger, "clearTrigger");
export const Content = withContext(Select.Content, "content");
export const Control = withContext(Select.Control, "control");
export const Indicator = withContext(Select.Indicator, "indicator");
export const ItemGroupLabel = withContext(Select.ItemGroupLabel, "itemGroupLabel");
export const ItemGroup = withContext(Select.ItemGroup, "itemGroup");
export const ItemIndicator = withContext(Select.ItemIndicator, "itemIndicator");
export const Item = withContext(Select.Item, "item");
export const ItemText = withContext(Select.ItemText, "itemText");
export const Label = withContext(Select.Label, "label");
export const List = withContext(Select.List, "list");
export const Positioner = withContext(Select.Positioner, "positioner");
export const Trigger = withContext(Select.Trigger, "trigger");
export const ValueText = withContext(Select.ValueText, "valueText");

export { SelectContext as Context, SelectHiddenSelect as HiddenSelect } from "@ark-ui/react/select";
