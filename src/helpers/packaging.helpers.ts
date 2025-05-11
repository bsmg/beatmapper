import { ColorScheme, EnvironmentSchemeName, createBeatmap, createInfo } from "bsmap";
import type { EnvironmentName, v2 as v2t, wrapper } from "bsmap/types";
import { colorToHex } from "bsmap/utils";

import { DEFAULT_GRID } from "$/constants";
import { App, type BeatmapId } from "$/types";
import { withKeys as hasKeys, maybeObject } from "$/utils";
import { deserializeCustomBookmark, serializeCustomBookmark } from "./bookmarks.helpers";
import { resolveSchemeColorWithOverdrive } from "./colors.helpers";
import type { BeatmapEntitySerializationOptions, LightshowEntitySerializationOptions } from "./object.helpers";
import type { ImplicitVersion } from "./serialization.helpers";
import { getAllBeatmaps, getColorScheme, getModSettings, isFastWallsEnabled, isModuleEnabled, resolveBeatmapIdFromFilename } from "./song.helpers";

export function resolveBeatmapFilenameForImplicitVersion(version: ImplicitVersion, beatmapId: BeatmapId, type: "beatmap" | "lightshow") {
	switch (version) {
		case 1: {
			return `${beatmapId}.json`;
		}
		case 4: {
			return `${beatmapId}.${type}.dat`;
		}
		default: {
			return `${beatmapId}.dat`;
		}
	}
}

function coalesceBeatmapCollection(data: App.Song) {
	const beatmaps = getAllBeatmaps(data);

	// Has this song enabled any mod support?
	const enabledCustomColors = isModuleEnabled(data, "customColors");
	const mappingExtensionsEnabled = isModuleEnabled(data, "mappingExtensions");

	const requirements: string[] = [];
	if (mappingExtensionsEnabled) {
		requirements.push("Mapping Extensions");
	}

	const colors = enabledCustomColors ? getColorScheme(data) : undefined;

	const customColors = maybeObject({
		_colorLeft: colors?.colorLeft ? resolveSchemeColorWithOverdrive(App.BeatmapColorKey.SABER_LEFT, colors.colorLeft, colors.colorLeftOverdrive) : undefined,
		_colorRight: colors?.colorRight ? resolveSchemeColorWithOverdrive(App.BeatmapColorKey.SABER_RIGHT, colors.colorRight, colors.colorRightOverdrive) : undefined,
		_envColorLeft: colors?.envColorLeft ? resolveSchemeColorWithOverdrive(App.BeatmapColorKey.ENV_LEFT, colors.envColorLeft, colors.envColorLeftOverdrive) : undefined,
		_envColorRight: colors?.envColorRight ? resolveSchemeColorWithOverdrive(App.BeatmapColorKey.ENV_RIGHT, colors.envColorRight, colors.envColorRightOverdrive) : undefined,
		_obstacleColor: colors?.obstacleColor ? resolveSchemeColorWithOverdrive(App.BeatmapColorKey.OBSTACLE, colors.obstacleColor, colors.obstacleColorOverdrive) : undefined,
	});

	const editorSettings: App.EditorInfoData["editorSettings"] = {
		enabledFastWalls: isFastWallsEnabled(data) ?? undefined,
		modSettings: maybeObject(getModSettings(data)),
	};

	return { beatmaps, requirements, customColors, editorSettings };
}

function deriveModSettingsFromInfo(data: wrapper.IWrapInfo): App.ModSettings {
	const environmentSchemeName = EnvironmentSchemeName[data.environmentNames[0] ?? data.environmentBase.normal];
	const environmentScheme = ColorScheme[environmentSchemeName];
	const defaultScheme = ColorScheme["Default Custom"] as Required<v2t.IColorScheme>;

	function resolveColor(data: wrapper.IWrapInfo, keys: { wrapper: keyof wrapper.IWrapInfoColorScheme; custom: keyof v2t.IColorScheme }) {
		if (data.difficulties.some((x) => hasKeys(x.customData, "_colorLeft", "_colorRight", "_envColorLeft", "_envColorRight", "_obstacleColor"))) {
			const customColorExists = data.difficulties.find((x) => x.customData[keys.custom]);
			const customColor = customColorExists?.customData[keys.custom];
			if (customColor) return colorToHex(customColor).slice(0, 7);
		}
		if (data.colorSchemes.length > 0) {
			return colorToHex(data.colorSchemes[0][keys.wrapper as "saberLeftColor"]).slice(0, 7);
		}
		return colorToHex(environmentScheme[keys.custom] ?? defaultScheme[keys.custom]).slice(0, 7);
	}

	return {
		customColors: {
			isEnabled: data.colorSchemes.some((x) => x.overrideNotes || x.overrideLights) || data.difficulties.some((beatmap) => hasKeys(beatmap.customData, "_colorLeft", "_colorRight", "_envColorLeft", "_envColorRight", "_obstacleColor")),
			colorLeft: resolveColor(data, { wrapper: "saberLeftColor", custom: "_colorLeft" }),
			colorRight: resolveColor(data, { wrapper: "saberRightColor", custom: "_colorRight" }),
			envColorLeft: resolveColor(data, { wrapper: "environment0Color", custom: "_envColorLeft" }),
			envColorRight: resolveColor(data, { wrapper: "environment1Color", custom: "_envColorRight" }),
			obstacleColor: resolveColor(data, { wrapper: "obstaclesColor", custom: "_obstacleColor" }),
		},
		mappingExtensions: {
			isEnabled: data.difficulties.some((beatmap) => beatmap.customData._requirements?.includes("Mapping Extensions")),
			...data.customData.editors?.Beatmapper?.editorSettings?.modSettings?.mappingExtensions,
			...DEFAULT_GRID,
		},
	};
}

export interface InfoSerializationOptions {
	songDuration?: number;
}
export interface InfoDeserializationOptions {
	readonly?: boolean;
}

export function serializeInfoContents(data: App.Song, options: InfoSerializationOptions) {
	const { beatmaps, customColors, editorSettings } = coalesceBeatmapCollection(data);

	return createInfo({
		song: {
			title: data.name,
			subTitle: data.subName,
			author: data.artistName,
		},
		audio: {
			filename: data.songFilename,
			audioDataFilename: "AudioData.dat",
			bpm: data.bpm,
			duration: options.songDuration,
			previewStartTime: data.previewStartTime,
			previewDuration: data.previewDuration,
		},
		environmentBase: {
			normal: data.environment,
		},
		environmentNames: [data.environment],
		songPreviewFilename: data.songFilename,
		coverImageFilename: data.coverArtFilename,
		difficulties: beatmaps.map(
			(beatmap): Partial<wrapper.IWrapInfoBeatmap> => ({
				characteristic: beatmap.characteristic,
				difficulty: beatmap.difficulty,
				njs: beatmap.noteJumpSpeed,
				njsOffset: beatmap.startBeatOffset,
				customData: maybeObject({
					_colorLeft: customColors?._colorLeft,
					_colorRight: customColors?._colorRight,
					_envColorLeft: customColors?._envColorLeft,
					_envColorRight: customColors?._envColorRight,
					_obstacleColor: customColors?._obstacleColor,
				}),
			}),
		),
		customData: {
			_editors: {
				_lastEditedBy: "Beatmapper",
				Beatmapper: {
					version: version,
					editorSettings: maybeObject(editorSettings),
				},
			},
		},
	});
}
export function deserializeInfoContents(data: wrapper.IWrapInfo, options: InfoDeserializationOptions): App.Song {
	const beatmapsById = data.difficulties.reduce((acc: App.Beatmaps, beatmap) => {
		const beatmapId = resolveBeatmapIdFromFilename(beatmap.filename);
		const lightshowId = resolveBeatmapIdFromFilename(beatmap.lightshowFilename);
		acc[beatmapId] = {
			beatmapId: beatmapId,
			lightshowId: lightshowId,
			characteristic: beatmap.characteristic,
			difficulty: beatmap.difficulty,
			noteJumpSpeed: beatmap.njs,
			startBeatOffset: beatmap.njsOffset,
			customLabel: beatmap.customData?._difficultyLabel,
		};
		return acc;
	}, {});

	return {
		name: data.song.title,
		subName: data.song.subTitle,
		artistName: data.song.author,
		bpm: data.audio.bpm,
		offset: data.difficulties[0].customData._editorOffset ?? 0,
		previewStartTime: data.audio.previewStartTime,
		previewDuration: data.audio.previewDuration,
		environment: data.environmentBase.normal ?? (data.environmentNames[0] as EnvironmentName),
		songFilename: data.audio.filename,
		coverArtFilename: data.coverImageFilename,
		difficultiesById: beatmapsById,
		demo: options.readonly,
		modSettings: deriveModSettingsFromInfo(data),
	};
}

export interface BeatmapSerializationOptions extends BeatmapEntitySerializationOptions<"mapping-extensions">, LightshowEntitySerializationOptions {
	editorOffsetInBeats?: number;
}
export interface BeatmapDeserializationOptions extends BeatmapEntitySerializationOptions<"mapping-extensions">, LightshowEntitySerializationOptions {
	editorOffsetInBeats?: number;
}

function shiftByOffset<T extends { time: number }>(options: { editorOffsetInBeats: number }) {
	return (item: T) => ({ ...item, time: item.time + options.editorOffsetInBeats }) as T;
}

export function serializeBeatmapContents(data: Partial<App.BeatmapEntities>, { editorOffsetInBeats = 0 }: BeatmapSerializationOptions) {
	const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats }));
	const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats }));
	const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats }));
	const events = data.events?.map(shiftByOffset({ editorOffsetInBeats }));
	const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeCustomBookmark(3, x, {}));

	return createBeatmap({
		difficulty: {
			colorNotes: notes,
			bombNotes: bombs,
			obstacles: obstacles,
			customData: {
				bookmarks: bookmarks,
			},
		},
		lightshow: {
			basicEvents: events,
		},
	});
}
export function deserializeBeatmapContents(data: wrapper.IWrapBeatmap, { editorOffsetInBeats = 0 }: BeatmapDeserializationOptions) {
	const notes = data.difficulty.colorNotes;
	const bombs = data.difficulty.bombNotes;
	const obstacles = data.difficulty.obstacles;
	const events = data.lightshow.basicEvents;
	const bookmarks = [
		...(data.difficulty.customData?._bookmarks?.map((x) => deserializeCustomBookmark(2, x, {})) ?? []),
		...(data.difficulty.customData?.bookmarks?.map((x) => deserializeCustomBookmark(3, x, {})) ?? []),
		//
	];

	return {
		notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		bookmarks: bookmarks?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
	};
}
