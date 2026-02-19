"use client";

import { ark } from "@ark-ui/react/factory";
import { type Consumer, createContext, useContext } from "react";

import { createStyleContext } from "$:styled-system/jsx";
import { type ListVariantProps, list } from "$:styled-system/recipes";

const ListContext = createContext<ListVariantProps | null>(null);

const { withContext, withProvider, withRootProvider } = createStyleContext(list);

export const Root = withProvider(ark.ul, "root");
export const Item = withContext(ark.li, "item");
export const Indicator = withContext(ark.span, "indicator");

export const Provider = withRootProvider(ListContext.Provider);
export const Context = ListContext.Consumer as Consumer<NonNullable<ListVariantProps>>;

export const useListContext = () => {
	const context = useContext(ListContext);
	if (!context) throw new Error("useListContext must be used within ListContext.Provider.");
	return context;
};
