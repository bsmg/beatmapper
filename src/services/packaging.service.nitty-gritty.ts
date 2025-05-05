import { retrieveVersion } from "bsmap";
import type { v2 } from "bsmap/types";
import type JSZip from "jszip";

import { DEFAULT_GRID } from "$/constants";
import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { formatColorFromImport } from "$/helpers/colors.helpers";
import type { ImplicitVersion } from "$/helpers/serialization.helpers";
import { App } from "$/types";
import { isEmpty, roundAwayFloatingPointNonsense } from "$/utils";

export function resolveImplicitVersion(data: object, fallback: ImplicitVersion) {
	const version = retrieveVersion(data);
	if (!version) return fallback;
	const major = version.split(".")[0];
	return Number.parseInt(major) as ImplicitVersion;
}

export function getFileFromArchive(archive: JSZip, ...filenames: string[]) {
	// Ideally, our .zip archive will just have all the files we need.
	const allFilenamesInArchive = Object.keys(archive.files);
	for (const filename of filenames) {
		const matchingFilename = allFilenamesInArchive.find((name) => name.toLowerCase() === filename.toLowerCase());
		if (matchingFilename) return archive.files[matchingFilename];
	}
	throw new Error(`No matching file in archive for filenames: ${filenames.toString()}`);
}

export async function getArchiveVersion(archive: JSZip) {
	const file = getFileFromArchive(archive, "Info.dat", "info.json");
	const raw = await file.async("text");
	const json = JSON.parse(raw) as object;
	return resolveImplicitVersion(json, 2);
}

function shiftEntitiesByOffsetInBeats<T extends v2.IBaseObject>(entities: T[], offsetInBeats: number) {
	return entities.map((entity) => {
		let time = roundAwayFloatingPointNonsense((entity._time ?? 0) + offsetInBeats);

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

export function shiftEntitiesByOffset<T extends v2.IBaseObject>(entities: T[], offset: number, bpm: number) {
	const offsetInBeats = convertMillisecondsToBeats(offset, bpm);

	return shiftEntitiesByOffsetInBeats(entities, offsetInBeats);
}

export function unshiftEntitiesByOffset<T extends v2.IBaseObject>(entities: T[], offset: number, bpm: number) {
	let offsetInBeats = convertMillisecondsToBeats(offset, bpm);

	// Because we're UNshifting, we need to invert the offset
	offsetInBeats *= -1;

	return shiftEntitiesByOffsetInBeats(entities, offsetInBeats);
}

export function deriveDefaultModSettingsFromBeatmap(beatmapSet: v2.IInfoSet) {
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

			for (const key of Object.values(App.BeatmapColorKey)) {
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
