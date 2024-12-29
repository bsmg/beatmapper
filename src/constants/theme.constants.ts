import { Difficulty } from "$/types";

export const COLORS = {
	gray: {
		100: "hsl(0, 0%, 92%)",
		300: "hsl(0, 0%, 60%)",
		500: "hsl(0, 0%, 28%)",
		700: "hsl(0, 0%, 14%)",
		900: "hsl(0, 0%, 7%)",
	},
	blueGray: {
		50: "hsl(222, 4%, 96%)",
		100: "hsl(222, 4%, 92%)",
		200: "hsl(222, 5%, 85%)",
		300: "hsl(222, 7%, 60%)",
		400: "hsl(222, 8.5%, 42%)",
		500: "hsl(222, 10%, 28%)",
		700: "hsl(222, 15%, 18%)",
		900: "hsl(222, 25%, 12%)",
		1000: "hsl(222, 30%, 7%)",
		1100: "hsl(222, 32%, 4%)",
	},
	pink: {
		500: "hsl(310, 100%, 50%)",
		700: "hsl(302, 100%, 42%)",
	},
	red: {
		300: "hsl(360, 100%, 75%)",
		500: "hsl(360, 100%, 50%)",
		700: "hsl(350, 80%, 30%)",
	},
	blue: {
		500: "hsl(212, 100%, 45%)",
		700: "hsl(222, 100%, 40%)",
	},
	yellow: {
		300: "hsl(44, 100%, 80%)",
		500: "hsl(48, 100%, 60%)",
	},
	green: {
		500: "hsl(160, 100%, 45%)",
		700: "hsl(165, 100%, 30%)",
	},
	white: "#FFFFFF",
	black: "#000000",
} as const;

export const UNIT = 8;

export const HEADER_HEIGHT = 75;
export const FOOTER_HEIGHT = 100;
export const SIDEBAR_WIDTH = 55;
export const MEDIA_ROW_HEIGHT = 150;

export const DIFFICULTY_COLORS = {
	[Difficulty.EASY]: "#4AFFBE",
	[Difficulty.NORMAL]: "#FCFF6A",
	[Difficulty.HARD]: "#4AE9FF",
	[Difficulty.EXPERT]: "#FF4A6B",
	[Difficulty.EXPERT_PLUS]: "#FF5FF9",
} as const;

export const BOOKMARK_COLORS = [
	{ background: "#F50057", text: "white" }, // pink
	{ background: "#FFEA00", text: "black" }, // yellow
	{ background: "#D500F9", text: "white" }, // purple
	{ background: "#64DD17", text: "black" }, // green
	{ background: "#0091EA", text: "white" }, // blue
	{ background: "#FF9100", text: "black" }, // orange
] as const;
