import { ark } from "@ark-ui/react/factory";
import { type Consumer, createContext } from "react";

import { type RecipeVariantProps, sva } from "$:styled-system/css";
import { hstack, stack } from "$:styled-system/patterns";
import { createStyleContext } from "../../utils/create-style-context";

const recipe = sva({
	slots: ["root", "item", "indicator"],
	base: {
		root: stack.raw({
			marginBlock: 1.5,
			gap: 1,
			"& :where(ul, ol)": { marginTop: 1 },
		}),
		item: {
			lineHeight: 1.5,
			color: "fg.default",
			listStylePosition: "inside",
			_marker: { margin: 0 },
		},
		indicator: {
			flexShrink: 0,
			display: "inline-block",
			verticalAlign: "middle",
			color: "colorPalette.500",
		},
	},
	variants: {
		variant: {
			marker: {
				root: {
					listStyle: "revert",
				},
				item: {
					_marker: { color: "colorPalette.500" },
				},
				indicator: { marginInlineEnd: 2 },
			},
			plain: {
				item: hstack.raw({ gap: 2 }),
			},
		},
	},
	defaultVariants: {
		variant: "marker",
	},
});

const ListContext = createContext<RecipeVariantProps<typeof recipe> | null>(null);

const { withContext, withProvider, withRootProvider } = createStyleContext(recipe);

export const Root = withProvider(ark.ul, "root");
export const Item = withContext(ark.li, "item");
export const Indicator = withContext(ark.span, "indicator");

export const Provider = withRootProvider(ListContext.Provider);
export const Context = ListContext.Consumer as Consumer<NonNullable<RecipeVariantProps<typeof recipe>>>;
