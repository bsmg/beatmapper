"use client";

import { ark } from "@ark-ui/react/factory";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";

const recipe = sva({
	slots: ["root", "label", "valueText"],
	base: {
		root: vstack.raw({
			gap: 0,
		}),
		label: {
			textStyle: "heading",
			color: "fg.muted",
		},
		valueText: {
			textStyle: "paragraph",
			fontFamily: "monospace",
			color: "fg.default",
		},
	},
	variants: {
		size: {
			sm: { label: { fontSize: "0.75rem" } },
			md: { label: { fontSize: "1rem" } },
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(ark.div, "root");
export const Label = withContext(ark.h4, "label");
export const ValueText = withContext(ark.span, "valueText");
