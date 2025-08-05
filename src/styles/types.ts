import type { ColorPalette } from "$:styled-system/tokens";

export type VirtualColorPalette = Extract<ColorPalette, "slate" | "pink" | "red" | "blue" | "yellow" | "green">;
