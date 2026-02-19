"use client";

import { Accordion } from "@ark-ui/react/accordion";

import { createStyleContext } from "$:styled-system/jsx";
import { accordion } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(accordion);

export const RootProvider = withProvider(Accordion.RootProvider, "root");
export const Root = withProvider(Accordion.Root, "root");
export const ItemContent = withContext(Accordion.ItemContent, "itemContent");
export const ItemIndicator = withContext(Accordion.ItemIndicator, "itemIndicator");
export const Item = withContext(Accordion.Item, "item");
export const ItemTrigger = withContext(Accordion.ItemTrigger, "itemTrigger");

export type { AccordionFocusChangeDetails as FocusChangeDetails, AccordionValueChangeDetails as ValueChangeDetails } from "@ark-ui/react/accordion";
export { AccordionContext as Context, AccordionItemContext as ItemContext } from "@ark-ui/react/accordion";
