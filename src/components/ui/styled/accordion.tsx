"use client";
import { Accordion, accordionAnatomy } from "@ark-ui/react/accordion";

import { sva } from "$:styled-system/css";
import { hstack, vstack } from "$:styled-system/patterns";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: accordionAnatomy.keys(),
	base: {
		root: vstack.raw({
			gap: 1,
		}),
		item: {
			width: "100%",
		},
		itemTrigger: hstack.raw({
			paddingInline: "12px",
			marginInlineEnd: 2,
			width: "100%",
			height: "40px",
			justify: "space-between",
			fontFamily: "body",
			fontSize: "15px",
			fontWeight: 400,
			textTransform: "uppercase",
			borderRadius: "sm",
			layerStyle: "fill.ghost",
			userSelect: "none",
			cursor: { base: "pointer", _disabled: "not-allowed" },
		}),
		itemContent: {
			marginBlock: 0.5,
		},
		itemIndicator: {
			transform: { _open: "rotate(180deg)" },
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Accordion.RootProvider, "root");
export const Root = withProvider(Accordion.Root, "root");
export const ItemContent = withContext(Accordion.ItemContent, "itemContent");
export const ItemIndicator = withContext(Accordion.ItemIndicator, "itemIndicator");
export const Item = withContext(Accordion.Item, "item");
export const ItemTrigger = withContext(Accordion.ItemTrigger, "itemTrigger");

export { AccordionContext as Context, AccordionItemContext as ItemContext } from "@ark-ui/react/accordion";
export type { AccordionFocusChangeDetails as FocusChangeDetails, AccordionValueChangeDetails as ValueChangeDetails } from "@ark-ui/react/accordion";
