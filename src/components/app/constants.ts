import { createListCollection } from "@ark-ui/react/collection";
import { createToaster } from "@ark-ui/react/toast";
import { EnvironmentRename } from "bsmap";
import { EnvironmentName } from "bsmap/types";

import { token } from "$:styled-system/tokens";
import { DIFFICULTIES } from "$/constants";
import { getLabelForDifficulty } from "$/helpers/song.helpers";
import type { App, BeatmapId } from "$/types";

export const APP_TOASTER = createToaster({
	placement: "bottom-end",
	overlap: true,
	max: 8,
});

export const DIFFICULTY_COLLECTION = createListCollection({
	items: DIFFICULTIES.map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
	itemToString: (item) => getLabelForDifficulty(item.value),
});

export const ENVIRONMENT_COLLECTION = createListCollection({
	items: EnvironmentName,
	itemToString: (item) => EnvironmentRename[item],
});

interface BeatmapListCollectionOptions {
	song: App.Song;
}
export function createBeatmapListCollection({ song }: BeatmapListCollectionOptions) {
	return createListCollection({
		items: Object.keys(song.difficultiesById),
	});
}

interface BeatmapDifficultyListCollection {
	beatmapIds: BeatmapId[];
	currentBeatmapId?: BeatmapId;
}
export function createBeatmapDifficultyListCollection({ beatmapIds, currentBeatmapId }: BeatmapDifficultyListCollection) {
	return createListCollection({
		items: DIFFICULTIES.map((value) => ({ value, color: token.var(`colors.difficulty.${value}`) })),
		itemToString: (item) => getLabelForDifficulty(item.value),
		isItemDisabled: (item) => item.value === currentBeatmapId || beatmapIds.includes(item.value),
	});
}
