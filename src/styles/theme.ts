import { defineKeyframes, defineSemanticTokens, defineTokens } from "@pandacss/dev";

import { Difficulty } from "../types";

export const tokens = defineTokens({
	colors: {
		gray: {
			100: { value: "hsl(0, 0%, 92%)" },
			300: { value: "hsl(0, 0%, 60%)" },
			500: { value: "hsl(0, 0%, 28%)" },
			700: { value: "hsl(0, 0%, 14%)" },
			900: { value: "hsl(0, 0%, 7%)" },
		},
		slate: {
			50: { value: "hsl(222, 4%, 96%)" },
			100: { value: "hsl(222, 4%, 92%)" },
			200: { value: "hsl(222, 5%, 85%)" },
			300: { value: "hsl(222, 7%, 60%)" },
			400: { value: "hsl(222, 8.5%, 42%)" },
			500: { value: "hsl(222, 10%, 28%)" },
			700: { value: "hsl(222, 15%, 18%)" },
			900: { value: "hsl(222, 25%, 12%)" },
			1000: { value: "hsl(222, 30%, 7%)" },
			1100: { value: "hsl(222, 32%, 4%)" },
		},
		pink: {
			500: { value: "hsl(310, 100%, 50%)" },
			700: { value: "hsl(302, 100%, 42%)" },
		},
		red: {
			300: { value: "hsl(360, 100%, 75%)" },
			500: { value: "hsl(360, 100%, 50%)" },
			700: { value: "hsl(350, 80%, 30%)" },
		},
		blue: {
			500: { value: "hsl(212, 100%, 45%)" },
			700: { value: "hsl(222, 100%, 40%)" },
		},
		yellow: {
			300: { value: "hsl(44, 100%, 80%)" },
			500: { value: "hsl(48, 100%, 60%)" },
		},
		green: {
			500: { value: "hsl(160, 100%, 45%)" },
			700: { value: "hsl(165, 100%, 30%)" },
		},
	},
});

export const semanticTokens = defineSemanticTokens({
	colors: {
		difficulty: {
			[Difficulty.EASY]: { value: "#4AFFBE" },
			[Difficulty.NORMAL]: { value: "#FCFF6A" },
			[Difficulty.HARD]: { value: "#4AE9FF" },
			[Difficulty.EXPERT]: { value: "#FF4A6B" },
			[Difficulty.EXPERT_PLUS]: { value: "#FF5FF9" },
		},
	},
	sizes: {
		header: { value: "75px" },
		footer: { value: "100px" },
		sidebar: { value: "55px" },
		mediaRow: { value: "150px" },
		iconButton: { value: "36px" },
		statusBar: { value: "30px" },
		navigationPanel: { value: "180px" },
		actionPanelFull: { value: "110px" },
		actionPanelHalf: { value: "calc(({sizes.actionPanelFull} / 2) - {spacing.0.5})" },
	},
});

export const keyframes = defineKeyframes({
	spin: {
		"100%": { transform: "rotate(1turn)" },
	},
});
