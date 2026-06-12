import { createListCollection } from "@ark-ui/react/collection";
import type { FileMimeType } from "@zag-js/file-utils";
import { CharacteristicName, CharacteristicRename, DifficultyName, DifficultyRename, EnvironmentName, EnvironmentRename, is360Environment, isV2Environment, isV3Environment } from "bsmap";
import { nonEmpty, null_, number, object, pipe, regex, string, union } from "valibot";

import { createPromptFactory } from "$/components/ui/compositions";
import type { App } from "$/types";

export const SONG_FILE_ACCEPT_TYPE: FileMimeType[] = ["audio/ogg", "application/ogg"];
export const COVER_ART_FILE_ACCEPT_TYPE: FileMimeType[] = ["image/jpeg", "image/png"];
export const MAP_ARCHIVE_FILE_ACCEPT_TYPE: FileMimeType[] = ["application/zip", "application/x-zip-compressed", "application/octet-stream"];

export const CHARACTERISTIC_COLLECTION = createListCollection({
	items: CharacteristicName,
	itemToValue: (item) => item,
	itemToString: (item) => CharacteristicRename[item],
});
export const DIFFICULTY_COLLECTION = createListCollection({
	items: DifficultyName,
	itemToValue: (item) => item,
	itemToString: (item) => DifficultyRename[item],
});
export const ENVIRONMENT_COLLECTION = createListCollection({
	items: EnvironmentName.filter((x) => isV2Environment(x) || isV3Environment(x)),
	itemToString: (item) => EnvironmentRename[item],
});
export const ENVIRONMENT_OVERRIDE_COLLECTION = createListCollection({
	items: EnvironmentName.filter((x) => (isV2Environment(x) || isV3Environment(x) || is360Environment(x)) && x !== "MultiplayerEnvironment"),
	itemToString: (item) => EnvironmentRename[item],
});

interface BeatmapCharacteristicListCollection {
	beatmaps: App.IBeatmap[];
}
export function createBeatmapCharacteristicListCollection({ beatmaps }: BeatmapCharacteristicListCollection) {
	return createListCollection({
		...CHARACTERISTIC_COLLECTION,
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === item);
			if (withMatchingCharacteristic.length >= DIFFICULTY_COLLECTION.size) return true;
			return false;
		},
	});
}

interface BeatmapDifficultyListCollection {
	beatmaps: App.IBeatmap[];
	characteristic: CharacteristicName;
}
export function createBeatmapDifficultyListCollection({ beatmaps, characteristic: selectedCharacteristic }: BeatmapDifficultyListCollection) {
	return createListCollection({
		...DIFFICULTY_COLLECTION,
		isItemDisabled: (item) => {
			const withMatchingCharacteristic = beatmaps.filter((beatmap) => beatmap.characteristic === selectedCharacteristic);
			if (withMatchingCharacteristic.length >= DIFFICULTY_COLLECTION.size) return true;
			const withMatchingDifficulty = withMatchingCharacteristic.some((beatmap) => beatmap.difficulty === item);
			if (withMatchingDifficulty) return true;
			return false;
		},
	});
}

export const createQuickSelectPrompt = createPromptFactory({
	title: "Quick Select",
	description: "Select all objects within the provided range of beats.",
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
	description: "Move the cursor to the provided beat number.",
	defaultValues: { beatNum: 0 },
	validate: object({ beatNum: number() }),
});

export const createAddBookmarkPrompt = createPromptFactory({
	title: "Add Bookmark",
	description: "Create a new bookmark at the current beat.",
	defaultValues: { name: "" },
	validate: object({ name: pipe(string(), nonEmpty()) }),
});

export const createAddColorSchemePrompt = createPromptFactory({
	title: "Add Color Scheme",
	description: "Create a new color scheme override that may be applied to any beatmaps within your mapset.",
	defaultValues: { name: "", preset: null },
	validate: object({ name: pipe(string(), nonEmpty()), preset: union([string(), null_()]) }),
});
