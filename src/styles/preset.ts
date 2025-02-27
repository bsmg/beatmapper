import { definePreset } from "@pandacss/dev";

import { keyframes, semanticTokens, tokens } from "./theme";

interface PresetOptions {
	unit?: number;
}
export default function preset({ unit = 8 }: PresetOptions) {
	const spacing = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 10, 36].reduce((acc: Record<number, { value: string }>, n) => {
		acc[n] = { value: `${unit * n}px` };
		return acc;
	}, {});

	return definePreset({
		name: "beatmapper",
		theme: {
			extend: {
				tokens: { ...tokens, spacing: spacing },
				semanticTokens: semanticTokens,
				keyframes: keyframes,
			},
		},
	});
}
