import { createListCollection } from "@ark-ui/react/collection";
import { createToaster } from "@ark-ui/react/toast";
import { CharacteristicRename, DifficultyRename, EnvironmentRename } from "bsmap";
import { type CharacteristicName, EnvironmentName } from "bsmap/types";

import { token } from "$:styled-system/tokens";
import { CHARACTERISTICS, DIFFICULTIES } from "$/constants";
import type { App, BeatmapId } from "$/types";

export const APP_TOASTER = createToaster({
	placement: "bottom-end",
	overlap: true,
	max: 8,
});

export const CHARACTERISTIC_COLLECTION = createListCollection({
	items: CHARACTERISTICS,
	itemToString: (item) => CharacteristicRename[item],
});
export const DIFFICULTY_COLLECTION = createListCollection({
	items: DIFFICULTIES.map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
	itemToString: (item) => DifficultyRename[item.value],
});

export const ENVIRONMENT_COLLECTION = createListCollection({
	items: EnvironmentName,
	itemToString: (item) => EnvironmentRename[item],
});

export const VERSION_COLLECTION = createListCollection({
	items: ["1", "2", "3", "4"],
	itemToString: (item) => ["1.5.0", "2.6.0", "3.3.0", "4.1.0"][Number.parseInt(item) - 1],
});

interface BeatmapListCollectionOptions {
	beatmapIds: BeatmapId[];
}
export function createBeatmapListCollection({ beatmapIds }: BeatmapListCollectionOptions) {
	return createListCollection({
		items: beatmapIds,
	});
}

interface BeatmapCharacteristicListCollection {
	beatmaps: App.Beatmap[];
	currentBeatmap?: App.Beatmap;
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
	beatmaps: App.Beatmap[];
	currentBeatmap?: App.Beatmap;
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
