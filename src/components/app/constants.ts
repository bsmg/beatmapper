import { createListCollection } from "@ark-ui/react/collection";
import type { FileMimeType } from "@zag-js/file-utils";
import { CharacteristicRename, DifficultyRename, EnvironmentRename } from "bsmap";
import { type CharacteristicName, EnvironmentName, EnvironmentV3Name } from "bsmap/types";
import { nonEmpty, number, object, pipe, regex, string } from "valibot";

import { createPromptFactory } from "$/components/ui/compositions";
import type { App } from "$/types";
import { token } from "$:styled-system/tokens";

export const SONG_FILE_ACCEPT_TYPE: FileMimeType[] = ["audio/ogg", "application/ogg"];
export const COVER_ART_FILE_ACCEPT_TYPE: FileMimeType[] = ["image/jpeg", "image/png"];
export const MAP_ARCHIVE_FILE_ACCEPT_TYPE: FileMimeType[] = ["application/zip", "application/x-zip-compressed", "application/octet-stream"];

export const CHARACTERISTIC_COLLECTION = createListCollection({
	items: (["Standard", "NoArrows", "OneSaber", "Legacy", "Lawless"] as const).map((value) => ({ value })),
	itemToValue: (item) => item.value,
	itemToString: (item) => CharacteristicRename[item.value],
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

interface BeatmapCharacteristicListCollection {
	beatmaps: App.IBeatmap[];
}
export function createBeatmapCharacteristicListCollection({ beatmaps }: BeatmapCharacteristicListCollection) {
	return createListCollection({
		items: CHARACTERISTIC_COLLECTION.items,
		itemToString: (item) => CharacteristicRename[item.value],
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === item.value);
			if (withMatchingCharacteristic.length >= DIFFICULTY_COLLECTION.size) return true;
			return false;
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

export const createQuickSelectPrompt = createPromptFactory({
	title: "Quick Select",
	description: "Selects all objects within the provided range of beats.",
	defaultValues: { range: "" },
	validate: object({
		range: pipe(
			string(),
			regex(/^\d+(-\d+)?$/, (issue) => `Invalid format: Expected <number> or <number>-<number> but received "${issue.input}"`),
		),
	}),
});

export const createJumpToBeatPrompt = createPromptFactory({
	title: "Jump to Beat",
	description: "Moves the cursor to the provided beat number.",
	defaultValues: { beatNum: 0 },
	validate: object({ beatNum: number() }),
});

export const createAddBookmarkPrompt = createPromptFactory({
	title: "Add Bookmark",
	description: "Creates a new bookmark at the current beat.",
	defaultValues: { name: "" },
	validate: object({ name: pipe(string(), nonEmpty()) }),
});

export const createAddColorSchemePrompt = createPromptFactory({
	title: "Add Color Scheme",
	defaultValues: { name: "" },
	validate: object({ name: pipe(string(), nonEmpty()) }),
});
