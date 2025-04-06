import { definePreset } from "@pandacss/dev";

import base from "@pandacss/dev/presets";

import { animationStyles, keyframes, layerStyles, semanticTokens, textStyles, tokens } from "./theme";
import * as utilities from "./utilities";

interface PresetOptions {
	unit?: number;
}
export default function preset({ unit = 8 }: PresetOptions) {
	const spacing = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 10, 36].reduce((acc: Record<number, { value: string }>, n) => {
		acc[n] = { value: `${unit * n}px` };
		return acc;
	}, {});

	return definePreset({
		name: "beatmapper",
		conditions: {
			extend: {
				hover: "&:is(:hover, [data-hover]):not(:disabled, [data-disabled])",
				active: "&:is(:active, [data-active=true], [data-status=active]):not(:disabled, [data-disabled], [data-state=open])",
				disabled: "&:is(:disabled, [disabled], [data-disabled])",
				loading: "&:is([data-loading=true], [aria-busy=true])",
				valid: "&:is(:valid, [data-valid], [data-state=valid])",
				invalid: "&:is(:invalid, [data-invalid], [aria-invalid=true], [data-state=invalid])",
			},
		},
		theme: {
			extend: {
				breakpoints: base.theme.breakpoints,
				tokens: { ...tokens, spacing: { ...spacing } },
				semanticTokens: semanticTokens,
				keyframes: keyframes,
				textStyles: textStyles,
				layerStyles: layerStyles,
				animationStyles: animationStyles,
			},
		},
		patterns: {
			extend: {
				container: {
					transform: () => ({
						position: "relative",
						maxWidth: "1000px",
						marginInline: "auto",
						paddingInline: { base: "4", md: "6", lg: "8" },
					}),
				},
			},
		},
		utilities: {
			extend: { ...utilities },
		},
		staticCss: {
			css: [{ properties: { colorPalette: ["slate", "pink", "red", "blue", "yellow", "green"] } }],
		},
	});
}
