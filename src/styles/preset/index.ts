import { definePreset } from "@pandacss/dev";

import { defineDynamicTokens } from "../utils";
import * as patterns from "./patterns";
import * as recipes from "./recipes";
import * as slotRecipes from "./slot-recipes";
import { animationStyles, keyframes, layerStyles, semanticTokens, textStyles, tokens } from "./theme";

interface PresetOptions {
	unit?: number;
}
export default function preset({ unit = 8 }: PresetOptions) {
	const colorPalette = ["slate", "gray", "pink", "red", "yellow", "green", "blue"];

	const spacing = defineDynamicTokens([0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 10, 36], (value) => {
		return { value: `${unit * value}px` };
	});

	return definePreset({
		name: "beatmapper",
		conditions: {
			extend: {
				hover: "&:is(:hover, [data-hover]):not(:disabled, [disabled], [data-disabled], [aria-disabled=true])",
				active: "&:is(:active, [data-active]):not(:disabled, [disabled], [data-disabled], [aria-disabled=true])",
			},
		},
		theme: {
			colorPalette: {
				include: colorPalette,
			},
			extend: {
				tokens: { ...tokens, spacing },
				semanticTokens: semanticTokens,
				keyframes: keyframes,
				textStyles: textStyles,
				layerStyles: layerStyles,
				animationStyles: animationStyles,
			},
			recipes: recipes,
			slotRecipes: slotRecipes,
		},
		patterns: {
			extend: { ...patterns },
		},
		staticCss: {
			css: [{ properties: { colorPalette } }],
		},
	});
}
