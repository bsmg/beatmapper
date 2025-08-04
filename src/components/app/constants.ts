import { createListCollection } from "@ark-ui/react";
import { createToaster } from "@ark-ui/react/toast";
import type { FileMimeType } from "@zag-js/file-utils";
import { CharacteristicRename, DifficultyRename, EnvironmentRename } from "bsmap";
import { type CharacteristicName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";

import { token } from "$:styled-system/tokens";
import { SNAPPING_INCREMENTS } from "$/constants";
import type { App, BeatmapId } from "$/types";
import { getMetaKeyLabel, range } from "$/utils";

export const APP_TOASTER = createToaster({
	placement: "bottom-end",
	overlap: true,
	max: 8,
});

export const EDITOR_TOASTER = createToaster({
	placement: "top-end",
	max: 1,
});

export const SONG_FILE_ACCEPT_TYPE: FileMimeType[] = ["audio/ogg"];
export const COVER_ART_FILE_ACCEPT_TYPE: FileMimeType[] = ["image/jpeg", "image/png"];
export const MAP_ARCHIVE_FILE_ACCEPT_TYPE: FileMimeType[] = ["application/zip", "application/x-zip-compressed", "application/octet-stream"];

export const CHARACTERISTIC_COLLECTION = createListCollection({
	items: ["Standard", "NoArrows", "OneSaber", "Legacy", "Lawless"] as const,
	itemToValue: (item) => item,
	itemToString: (item) => CharacteristicRename[item],
});
export const DIFFICULTY_COLLECTION = createListCollection({
	items: (["Easy", "Normal", "Hard", "Expert", "ExpertPlus"] as const).map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
	itemToValue: (item) => item.value,
	itemToString: (item) => DifficultyRename[item.value],
});

export const ENVIRONMENT_COLLECTION = createListCollection({
	items: [...EnvironmentName, ...EnvironmentV3Name],
	itemToString: (item) => EnvironmentRename[item],
});

export const VERSION_COLLECTION = createListCollection({
	items: ["1", "2", "3", "4"],
	itemToString: (item) => ["1.5.0", "2.6.0", "3.3.0", "4.1.0"][Number.parseInt(item) - 1],
});

export const SNAPPING_INCREMENT_LIST_COLLECTION = createListCollection({
	items: SNAPPING_INCREMENTS.map((x) => ({ ...x, value: x.value.toString() })),
	itemToValue: (item) => item.value,
	itemToString: (item) => (item.shortcutKey ? `${item.label} (${getMetaKeyLabel()}+${item.shortcutKey})` : item.label),
});

export const GRID_PRESET_SLOT_COLLECTION = createListCollection({
	items: Array.from(range(1, 4)).map((x) => ({ value: x.toString() })),
	itemToValue: (item) => item.value,
});

interface ColorSchemeListCollectionOptions {
	colorSchemeIds: string[];
}
export function createColorSchemeCollection({ colorSchemeIds }: ColorSchemeListCollectionOptions) {
	return createListCollection({
		items: ["", ...colorSchemeIds],
		itemToString: (item) => (item === "" ? "Unset" : item),
	});
}

interface BeatmapListCollectionOptions {
	beatmapIds: BeatmapId[];
}
export function createBeatmapListCollection({ beatmapIds }: BeatmapListCollectionOptions) {
	return createListCollection({
		items: beatmapIds,
	});
}

interface BeatmapCharacteristicListCollection {
	beatmaps: App.IBeatmap[];
	currentBeatmap?: App.IBeatmap;
}
export function createBeatmapCharacteristicListCollection({ beatmaps, currentBeatmap }: BeatmapCharacteristicListCollection) {
	return createListCollection({
		items: CHARACTERISTIC_COLLECTION.items,
		itemToString: (item) => CharacteristicRename[item],
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === item);
			if (withMatchingCharacteristic.length >= DIFFICULTY_COLLECTION.size) return true;
			return currentBeatmap?.characteristic === item;
		},
	});
}

interface BeatmapDifficultyListCollection {
	beatmaps: App.IBeatmap[];
	currentBeatmap?: App.IBeatmap;
	selectedCharacteristic: CharacteristicName;
}
export function createBeatmapDifficultyListCollection({ beatmaps, currentBeatmap, selectedCharacteristic }: BeatmapDifficultyListCollection) {
	return createListCollection({
		items: DIFFICULTY_COLLECTION.items,
		itemToString: (item) => DifficultyRename[item.value],
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === selectedCharacteristic);
			if (withMatchingCharacteristic.length >= DIFFICULTY_COLLECTION.size) return true;
			const withMatchingDifficulty = withMatchingCharacteristic.some((beatmap) => beatmap.difficulty === item.value);
			if (withMatchingDifficulty) return true;
			return currentBeatmap?.characteristic === selectedCharacteristic && currentBeatmap?.difficulty === item.value;
		},
	});
}
