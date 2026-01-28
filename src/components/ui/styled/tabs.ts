"use client";

import { Tabs } from "@ark-ui/react/tabs";

import { createStyleContext } from "$:styled-system/jsx";
import { tabs } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(tabs);

export const RootProvider = withProvider(Tabs.RootProvider, "root");
export const Root = withProvider(Tabs.Root, "root");
export const Content = withContext(Tabs.Content, "content");
export const Indicator = withContext(Tabs.Indicator, "indicator");
export const List = withContext(Tabs.List, "list");
export const Trigger = withContext(Tabs.Trigger, "trigger");

export { TabsContext as Context } from "@ark-ui/react/tabs";
