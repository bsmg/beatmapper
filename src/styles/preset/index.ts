import { definePreset } from "@pandacss/dev";

import { defineDynamicTokens } from "../utils";
import * as patterns from "./patterns";
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
				hover: "&:is(:hover, [data-hover]):not(:disabled, [data-disabled=true])",
				active: "&:is(:active, [data-active=true], [data-status=active]):not(:disabled, [data-disabled=true], [data-state=open])",
				disabled: "&:is(:disabled, [disabled], [data-disabled=true])",
				selected: "&:is([aria-selected=true], [data-selected=true])",
				loading: "&:is([data-loading=true], [aria-busy=true])",
				valid: "&:is(:valid, [data-valid], [data-state=valid])",
				invalid: "&:is(:invalid, [data-invalid], [aria-invalid=true], [data-state=invalid])",
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
		},
		patterns: {
			extend: { ...patterns },
		},
		staticCss: {
			css: [{ properties: { colorPalette } }],
		},
	});
}
