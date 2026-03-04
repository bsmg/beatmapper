import { distinct } from "@std/collections/distinct";
import { createBeatmap, createInfo, createInfoBeatmap } from "bsmap";
import type { EnvironmentAllName, v2, wrapper } from "bsmap/types";

import { type App, ColorSchemeKey, type IColorScheme, type IEntityMap } from "$/types";
import { deepAssign, ensureObject, hasKeys } from "$/utils";
import { deserializeCustomBookmark } from "./bookmarks.helpers";
import { deriveColorSchemeFromEnvironment, deserializeColorToHex, serializeColorToObject } from "./colors.helpers";
import { createDataFactory } from "./factory.helpers";
import { getBeatmaps, getCustomColorsModule, getExtensionsModule, isModuleEnabled, resolveBeatmapIdFromFilename, resolveLightshowIdFromFilename } from "./song.helpers";

function deriveEditorDataFromInfo(data: Omit<App.ISong, "id">): App.IEditorData["editorSettings"] {
	return {
		modSettings: ensureObject({
			mappingExtensions: isModuleEnabled(data, "mappingExtensions") ? getExtensionsModule(data) : undefined,
		}),
	};
}

export function patchEnvironmentName(environment: string): EnvironmentAllName {
	if (environment === "Origins") {
		return "OriginsEnvironment" as EnvironmentAllName;
	}
	return environment as EnvironmentAllName;
}

export function deriveModSettingsFromInfo(data: wrapper.IWrapInfo): Partial<App.IModSettings> {
	const activeCustomColors = Object.values(ColorSchemeKey).reduce(
		(acc, key) => {
			const color = data.difficulties.find((x) => x.customData[`_${key}`])?.customData[`_${key}`];
			acc[key as ColorSchemeKey] = color ? deserializeColorToHex(color).slice(0, 7) : undefined;
			return acc;
		},
		{} as { [key in ColorSchemeKey]?: string },
	);

	const isCustomColorsEnabled = data.difficulties.some((beatmap) => {
		return hasKeys(beatmap.customData, "_colorLeft", "_colorRight", "_envColorLeft", "_envColorRight", "_envColorWhite", "_envColorLeftBoost", "_envColorRightBoost", "_envColorWhiteBoost", "_obstacleColor");
	});

	const customColors = ensureObject({
		isEnabled: isCustomColorsEnabled,
		colorLeft: activeCustomColors.colorLeft ?? undefined,
		colorRight: activeCustomColors.colorRight ?? undefined,
		envColorLeft: activeCustomColors.envColorLeft ?? undefined,
		envColorRight: activeCustomColors.envColorRight ?? undefined,
		envColorWhite: activeCustomColors.envColorWhite ?? undefined,
		envColorLeftBoost: activeCustomColors.envColorLeftBoost ?? undefined,
		envColorRightBoost: activeCustomColors.envColorRightBoost ?? undefined,
		envColorWhiteBoost: activeCustomColors.envColorWhiteBoost ?? undefined,
		obstacleColor: activeCustomColors.obstacleColor ?? undefined,
	});

	const baseModSettings = {
		customColors: isCustomColorsEnabled ? customColors : undefined,
	};

	return deepAssign(baseModSettings, { ...data.customData.editors?.Beatmapper?.editorSettings?.modSettings });
}

export const { serialize: serializeInfoContents, deserialize: deserializeInfoContents } = createDataFactory({
	container: {
		serialize: function serializeInfoContents(data: Omit<App.ISong, "id">, options: { songDuration?: number | null }) {
			const beatmaps = getBeatmaps(data);

			const envColorScheme = deriveColorSchemeFromEnvironment(patchEnvironmentName(data.environment));

			const allColorSchemes = Object.entries(data.colorSchemesById).map(([name, scheme]): wrapper.IWrapInfoColorScheme => {
				return {
					name: name,
					overrideNotes: true,
					overrideLights: true,
					saberLeftColor: serializeColorToObject(scheme.colorLeft ?? envColorScheme.colorLeft, true),
					saberRightColor: serializeColorToObject(scheme.colorRight ?? envColorScheme.colorRight, true),
					obstaclesColor: serializeColorToObject(scheme.obstacleColor ?? envColorScheme.obstacleColor, true),
					environment0Color: serializeColorToObject(scheme.envColorLeft ?? envColorScheme.envColorLeft, true),
					environment1Color: serializeColorToObject(scheme.envColorRight ?? envColorScheme.envColorRight, true),
					environmentWColor: scheme.envColorWhite ? serializeColorToObject(scheme.envColorWhite ?? envColorScheme.envColorWhite, true) : undefined,
					environment0ColorBoost: serializeColorToObject(scheme.envColorLeftBoost ?? envColorScheme.envColorLeftBoost, true),
					environment1ColorBoost: serializeColorToObject(scheme.envColorRightBoost ?? envColorScheme.envColorRightBoost, true),
					environmentWColorBoost: scheme.envColorWhiteBoost ? serializeColorToObject(scheme.envColorWhiteBoost ?? envColorScheme.envColorWhiteBoost, true) : undefined,
				};
			});

			const allEnvironments = distinct(Object.values(beatmaps).map((x) => x.environmentName));

			const customColors = isModuleEnabled(data, "customColors") ? getCustomColorsModule(data) : undefined;

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
					duration: options.songDuration ? options.songDuration / 1000 : undefined,
					previewStartTime: data.previewStartTime,
					previewDuration: data.previewDuration,
				},
				environmentBase: {
					normal: data.environment,
				},
				environmentNames: allEnvironments,
				colorSchemes: allColorSchemes,
				songPreviewFilename: data.songFilename,
				coverImageFilename: data.coverArtFilename,
				difficulties: Object.entries(beatmaps).map(([beatmapId, beatmap]) => {
					return createInfoBeatmap({
						filename: `${beatmapId}.beatmap.dat`,
						lightshowFilename: `${beatmap.lightshowId && beatmap.lightshowId !== "Unnamed" ? beatmap.lightshowId : beatmapId}.lightshow.dat`,
						characteristic: beatmap.characteristic,
						difficulty: beatmap.difficulty,
						njs: beatmap.noteJumpSpeed,
						njsOffset: beatmap.startBeatOffset,
						environmentId: allEnvironments.indexOf(beatmap.environmentName),
						colorSchemeId: beatmap.colorSchemeName ? allColorSchemes.map((x) => x.name).indexOf(beatmap.colorSchemeName) : -1,
						authors: {
							mappers: beatmap.mappers.filter((x) => x.length > 0),
							lighters: beatmap.lighters.filter((x) => x.length > 0),
						},
						customData: ensureObject<v2.ICustomDataInfoDifficulty>({
							_colorLeft: customColors?.colorLeft ? serializeColorToObject(customColors.colorLeft) : undefined,
							_colorRight: customColors?.colorRight ? serializeColorToObject(customColors.colorRight) : undefined,
							_obstacleColor: customColors?.obstacleColor ? serializeColorToObject(customColors.obstacleColor) : undefined,
							_envColorLeft: customColors?.envColorLeft ? serializeColorToObject(customColors.envColorLeft) : undefined,
							_envColorRight: customColors?.envColorRight ? serializeColorToObject(customColors.envColorRight) : undefined,
							_envColorWhite: customColors?.envColorWhite ? serializeColorToObject(customColors.envColorWhite) : undefined,
							_envColorLeftBoost: customColors?.envColorLeftBoost ? serializeColorToObject(customColors.envColorLeftBoost) : undefined,
							_envColorRightBoost: customColors?.envColorRightBoost ? serializeColorToObject(customColors.envColorRightBoost) : undefined,
							_envColorWhiteBoost: customColors?.envColorWhiteBoost ? serializeColorToObject(customColors.envColorWhiteBoost) : undefined,
							_difficultyLabel: beatmap.customLabel !== "" ? beatmap.customLabel : undefined,
							_editorOffset: data.offset !== 0 ? data.offset : undefined,
						}),
					});
				}),
				customData: {
					_editors: {
						_lastEditedBy: "Beatmapper",
						Beatmapper: {
							version: version,
							editorSettings: deriveEditorDataFromInfo(data),
						},
					},
				},
			});
		},
		deserialize: function deserializeInfoContents(data: wrapper.IWrapInfo, options: { readonly?: boolean }): Omit<App.ISong, "id"> {
			const colorSchemesById = data.colorSchemes.reduce((acc: IEntityMap<IColorScheme>, scheme) => {
				acc[scheme.name] = {
					colorLeft: deserializeColorToHex(scheme.saberLeftColor).slice(0, 7),
					colorRight: deserializeColorToHex(scheme.saberRightColor).slice(0, 7),
					obstacleColor: deserializeColorToHex(scheme.obstaclesColor).slice(0, 7),
					envColorLeft: deserializeColorToHex(scheme.environment0Color).slice(0, 7),
					envColorRight: deserializeColorToHex(scheme.environment1Color).slice(0, 7),
					envColorWhite: scheme.environmentWColor ? deserializeColorToHex(scheme.environmentWColor).slice(0, 7) : undefined,
					envColorLeftBoost: deserializeColorToHex(scheme.environment0ColorBoost).slice(0, 7),
					envColorRightBoost: deserializeColorToHex(scheme.environment1ColorBoost).slice(0, 7),
					envColorWhiteBoost: scheme.environmentWColorBoost ? deserializeColorToHex(scheme.environmentWColorBoost).slice(0, 7) : undefined,
				};
				return acc;
			}, {});

			const beatmapsById = data.difficulties.reduce((acc: IEntityMap<App.IBeatmap>, beatmap) => {
				const beatmapId = resolveBeatmapIdFromFilename(beatmap.filename);
				const lightshowId = resolveLightshowIdFromFilename(beatmap.lightshowFilename, beatmapId);
				acc[beatmapId] = {
					lightshowId: lightshowId,
					characteristic: beatmap.characteristic,
					difficulty: beatmap.difficulty,
					noteJumpSpeed: beatmap.njs,
					startBeatOffset: beatmap.njsOffset,
					environmentName: data.environmentNames[beatmap.environmentId] ?? data.environmentBase.normal,
					colorSchemeName: beatmap.colorSchemeId >= 0 ? data.colorSchemes.map((x) => x.name)[beatmap.colorSchemeId] : null,
					mappers: beatmap.authors.mappers.filter((x) => x.length > 0),
					lighters: beatmap.authors.lighters.filter((x) => x.length > 0),
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
				environment: data.environmentBase.normal ?? "DefaultEnvironment",
				songFilename: data.audio.filename,
				coverArtFilename: data.coverImageFilename,
				difficultiesById: beatmapsById,
				colorSchemesById: colorSchemesById,
				demo: options.readonly,
				modSettings: deriveModSettingsFromInfo(data),
			};
		},
	},
});

function shiftByOffset<T extends { time: number }>(options: { editorOffsetInBeats: number }) {
	return (item: T) => ({ ...item, time: item.time + options.editorOffsetInBeats }) as T;
}

export const { serialize: serializeBeatmapContents, deserialize: deserializeBeatmapContents } = createDataFactory({
	container: {
		serialize: function serializeBeatmapContents(data: Partial<App.IBeatmapEntities>, { editorOffsetInBeats }: { editorOffsetInBeats: number }) {
			const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats }));
			const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats }));
			const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats }));
			const events = data.events?.map(shiftByOffset({ editorOffsetInBeats }));
			const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats }));

			return createBeatmap({
				difficulty: {
					colorNotes: notes,
					bombNotes: bombs,
					obstacles: obstacles,
				},
				lightshow: {
					basicEvents: events,
				},
				customData: {
					bookmarks: bookmarks,
				},
			});
		},
		deserialize: function deserializeBeatmapContents(data: wrapper.IWrapBeatmap, { editorOffsetInBeats }: { editorOffsetInBeats: number }): Partial<App.IBeatmapEntities> {
			const notes = data.difficulty.colorNotes;
			const bombs = data.difficulty.bombNotes;
			const obstacles = data.difficulty.obstacles;
			const events = data.lightshow.basicEvents;
			const bookmarks = distinct([
				...(data.difficulty.customData?._bookmarks?.map((x) => deserializeCustomBookmark(x, 2, {})) ?? []),
				...(data.difficulty.customData?.bookmarks?.map((x) => deserializeCustomBookmark(x, 3, {})) ?? []),
				//
			]);

			return {
				notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
				bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
				obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
				events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
				bookmarks: data.customData.bookmarks ?? bookmarks.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
			};
		},
	},
});
