import { getMetaKeyLabel, pluralize, roundTo } from "$/utils";

const META_KEY_LABEL = Object.freeze(getMetaKeyLabel());

export const SNAPPING_INCREMENTS = Object.freeze(
	[
		{ value: 1 / 64 } as const,
		{ value: 1 / 32 } as const,
		{ value: 1 / 24 } as const,
		{ value: 1 / 16, shortcutKey: 1 } as const,
		{ value: 1 / 12 } as const,
		{ value: 1 / 8, shortcutKey: 2 } as const,
		{ value: 1 / 6 } as const,
		{ value: 1 / 4, shortcutKey: 3 } as const,
		{ value: 1 / 3 } as const,
		{ value: 1 / 2, shortcutKey: 4 } as const,
		{ value: 1, shortcutKey: 5 } as const,
		{ value: 2, shortcutKey: 6 } as const,
		{ value: 4, shortcutKey: 7 } as const,
		{ value: 8, shortcutKey: 8 } as const,
		{ value: 16, shortcutKey: 9 } as const,
	].map(({ value, shortcutKey }) => {
		let label = `1/${roundTo(value ** -1)} Beat`;
		if (value >= 4) label = pluralize(value / 4, "Bar");
		if (value >= 1) label = pluralize(value, "Beat");
		return { value, label, shortcutKey, shortcutLabel: shortcutKey ? `${META_KEY_LABEL}+${shortcutKey}` : undefined } as const;
	}),
);

export const HIGHEST_PRECISION = SNAPPING_INCREMENTS[0].value;

export const BEATS_PER_ZOOM_LEVEL = [32, 16, 8, 4, 2] as const;

export const ZOOM_LEVEL_MIN = 0;
export const ZOOM_LEVEL_MAX = 4;

export const GRID_PRESET_SLOTS = ["1", "2", "3", "4"] as const;
