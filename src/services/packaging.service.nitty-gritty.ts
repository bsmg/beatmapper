import { COLOR_ELEMENT_IDS, DEFAULT_GRID } from "$/constants";
import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { formatColorFromImport } from "$/helpers/colors.helpers";
import { type App, Difficulty, type Json } from "$/types";
import { isEmpty, roundAwayFloatingPointNonsense } from "$/utils";
import type JSZip from "jszip";

export function getFileFromArchive(archive: JSZip, filename: string) {
	// Ideally, our .zip archive will just have all the files we need.
	const allFilenamesInArchive = Object.keys(archive.files);
	const matchingFilename = allFilenamesInArchive.find((name) => name.toLowerCase().includes(filename.toLowerCase()));
	if (!matchingFilename) return null;
	return archive.files[matchingFilename];
}

export function getDifficultyRankForDifficulty(difficulty: Pick<App.Beatmap, "id">) {
	switch (difficulty.id) {
		case Difficulty.EASY:
			return 1;
		case Difficulty.NORMAL:
			return 3;
		case Difficulty.HARD:
			return 5;
		case Difficulty.EXPERT:
			return 7;
		case Difficulty.EXPERT_PLUS:
			return 9;
		default:
			throw new Error("Unrecognized difficulty");
	}
}

export function getArchiveVersion(archive: JSZip) {
	// We could be importing a v1 or v2 song, we don't know which.
	// For now, I'm going to do the very lazy thing of just assuming based on the file type; v1 has `info.json` while v2 has `Info.dat`
	// TODO: More reliable version checking
	return getFileFromArchive(archive, "Info.dat") ? 2 : 1;
}

function shiftEntitiesByOffsetInBeats<T extends { _time: number }>(entities: T[], offsetInBeats: number) {
	return entities.map((entity) => {
		let time = roundAwayFloatingPointNonsense(entity._time + offsetInBeats);

		// For some reason, with offsets we can end up with a time of -0, which doesn't really make sense.
		if (time === 0) {
			time = 0;
		}
		return {
			...entity,
			_time: time,
		};
	});
}

export function shiftEntitiesByOffset<T extends { _time: number }>(entities: T[], offset: number, bpm: number) {
	const offsetInBeats = convertMillisecondsToBeats(offset, bpm);

	return shiftEntitiesByOffsetInBeats(entities, offsetInBeats);
}

export function unshiftEntitiesByOffset<T extends { _time: number }>(entities: T[], offset: number, bpm: number) {
	let offsetInBeats = convertMillisecondsToBeats(offset, bpm);

	// Because we're UNshifting, we need to invert the offset
	offsetInBeats *= -1;

	return shiftEntitiesByOffsetInBeats(entities, offsetInBeats);
}

export function deriveDefaultModSettingsFromBeatmap(beatmapSet: Json.BeatmapSet) {
	const modSettings = {} as App.ModSettings;

	for (const beatmap of beatmapSet._difficultyBeatmaps) {
		if (!beatmap._customData) {
			return;
		}

		if (Array.isArray(beatmap._customData._requirements) && beatmap._customData._requirements.includes("Mapping Extensions")) {
			modSettings.mappingExtensions = {
				isEnabled: true,
				// TODO: Should I save and restore the grid settings?
				...DEFAULT_GRID,
			};
		}

		if (!modSettings.customColors) {
			// Multiple beatmap difficulties might set custom colors, but Beatmapper only supports a single set of colors for all difficulties.
			// If we set any custom colors on previous beatmaps, we can skip this.
			const customColors = {} as Record<App.BeatmapColorKey, string>;

			for (const key of COLOR_ELEMENT_IDS) {
				const _key = `_${key}`;

				if (beatmap._customData?.[_key]) {
					customColors[key] = formatColorFromImport(beatmap._customData[_key]);
				}
			}

			// Only add `customColors` if we have at least 1 of these fields set.
			// If this difficulty doesn't set custom settings, we want to do nothing, since this is how the app knows whether custom colors are enabled or not.
			if (!isEmpty(customColors)) {
				modSettings.customColors = {
					isEnabled: true,
					...customColors,
				};
			}
		}
	}

	return modSettings;
}
