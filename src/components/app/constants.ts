import { createListCollection } from "@ark-ui/react";
import { createToaster } from "@ark-ui/react/toast";
import type { FileMimeType } from "@zag-js/file-utils";
import { CharacteristicRename, DifficultyRename, EnvironmentRename } from "bsmap";
import { type CharacteristicName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";

import { token } from "$:styled-system/tokens";
import { CHARACTERISTICS, DIFFICULTIES } from "$/constants";
import type { App, BeatmapId } from "$/types";

export const APP_TOASTER = createToaster({
	placement: "bottom-end",
	overlap: true,
	max: 8,
});

export const SONG_FILE_ACCEPT_TYPE: FileMimeType[] = ["audio/ogg"];
export const COVER_ART_FILE_ACCEPT_TYPE: FileMimeType[] = ["image/jpeg", "image/png"];
export const MAP_ARCHIVE_FILE_ACCEPT_TYPE: FileMimeType[] = ["application/x-zip-compressed"];

export const CHARACTERISTIC_COLLECTION = createListCollection({
	items: CHARACTERISTICS,
	itemToString: (item) => CharacteristicRename[item],
});
export const DIFFICULTY_COLLECTION = createListCollection({
	items: DIFFICULTIES.map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
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
		items: CHARACTERISTICS,
		itemToString: (item) => CharacteristicRename[item],
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === item);
			if (withMatchingCharacteristic.length >= DIFFICULTIES.length) return true;
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
		items: DIFFICULTIES.map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
		itemToString: (item) => DifficultyRename[item.value],
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === selectedCharacteristic);
			if (withMatchingCharacteristic.length >= DIFFICULTIES.length) return true;
			const withMatchingDifficulty = withMatchingCharacteristic.some((beatmap) => beatmap.difficulty === item.value);
			if (withMatchingDifficulty) return true;
			return currentBeatmap?.characteristic === selectedCharacteristic && currentBeatmap?.difficulty === item.value;
		},
	});
}
