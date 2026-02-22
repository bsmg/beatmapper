import { distinct } from "@std/collections/distinct";
import { createBeatmap, createInfo, createInfoBeatmap } from "bsmap";
import type { EnvironmentAllName, v2, wrapper } from "bsmap/types";

import { type Accept, type App, ColorSchemeKey, type IColorScheme, type IEntityMap, type IEventTracks } from "$/types";
import { deepAssign, ensureObject, hasKeys } from "$/utils";
import { deserializeCustomBookmark } from "./bookmarks.helpers";
import { deriveColorSchemeFromEnvironment, deserializeColorToHex, serializeColorToObject } from "./colors.helpers";
import { getBeatmaps, getCustomColorsModule, getExtensionsModule, isModuleEnabled, resolveBeatmapIdFromFilename, resolveLightshowIdFromFilename } from "./song.helpers";

type BeatmapExtensionsProvider = string;

export interface BeatmapEntitySerializationOptions<T extends BeatmapExtensionsProvider> {
	/** The provider for which to handle extended properties. If left undefined, will parse as a vanilla property. */
	extensionsProvider?: T;
}
export interface LightshowEntitySerializationOptions {
	tracks?: IEventTracks;
}

function coalesceBeatmapCollection(data: App.ISong) {
	const beatmaps = getBeatmaps(data);

	// Has this song enabled any mod support?
	const isCustomColorsEnabled = isModuleEnabled(data, "customColors");
	const isMappingExtensionsEnabled = isModuleEnabled(data, "mappingExtensions");

	const colors = isCustomColorsEnabled ? getCustomColorsModule(data) : undefined;

	const customColors = ensureObject({
		_colorLeft: colors?.colorLeft ? serializeColorToObject(colors.colorLeft) : undefined,
		_colorRight: colors?.colorRight ? serializeColorToObject(colors.colorRight) : undefined,
		_obstacleColor: colors?.obstacleColor ? serializeColorToObject(colors.obstacleColor) : undefined,
		_envColorLeft: colors?.envColorLeft ? serializeColorToObject(colors.envColorLeft) : undefined,
		_envColorRight: colors?.envColorRight ? serializeColorToObject(colors.envColorRight) : undefined,
		_envColorWhite: colors?.envColorWhite ? serializeColorToObject(colors.envColorWhite) : undefined,
		_envColorLeftBoost: colors?.envColorLeftBoost ? serializeColorToObject(colors.envColorLeftBoost) : undefined,
		_envColorRightBoost: colors?.envColorRightBoost ? serializeColorToObject(colors.envColorRightBoost) : undefined,
		_envColorWhiteBoost: colors?.envColorWhiteBoost ? serializeColorToObject(colors.envColorWhiteBoost) : undefined,
	});

	const editorSettings: App.IEditorData["editorSettings"] = ensureObject({
		modSettings: ensureObject({
			mappingExtensions: isMappingExtensionsEnabled ? getExtensionsModule(data) : undefined,
		}),
	});

	return { beatmaps, customColors, editorSettings };
}

export function patchEnvironmentName(environment: Accept<EnvironmentAllName, string>): EnvironmentAllName {
	if (environment === "Origins") return "OriginsEnvironment";
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

	const isCustomColorsEnabled = data.difficulties.some((beatmap) => hasKeys(beatmap.customData, "_colorLeft", "_colorRight", "_envColorLeft", "_envColorRight", "_envColorWhite", "_envColorLeftBoost", "_envColorRightBoost", "_envColorWhiteBoost", "_obstacleColor"));
	const isMappingExtensionsEnabled = data.difficulties.some((beatmap) => beatmap.customData._requirements?.includes("Mapping Extensions"));

	const customColors = ensureObject({
		...data.customData.editors?.Beatmapper?.editorSettings?.modSettings?.customColors,
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

	const mappingExtensions = {
		...data.customData.editors?.Beatmapper?.editorSettings?.modSettings?.mappingExtensions,
		isEnabled: isMappingExtensionsEnabled,
	};

	const baseModSettings = {
		customColors: isCustomColorsEnabled ? customColors : undefined,
		mappingExtensions: isMappingExtensionsEnabled ? mappingExtensions : undefined,
	};

	return deepAssign(baseModSettings, { ...data.customData.editors?.Beatmapper?.editorSettings?.modSettings });
}

export interface InfoSerializationOptions {
	songDuration?: number;
}
export interface InfoDeserializationOptions {
	readonly?: boolean;
}

export function serializeInfoContents(data: App.ISong, options: InfoSerializationOptions) {
	const { beatmaps, customColors, editorSettings } = coalesceBeatmapCollection(data);

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
					_colorLeft: customColors?._colorLeft,
					_colorRight: customColors?._colorRight,
					_obstacleColor: customColors?._obstacleColor,
					_envColorLeft: customColors?._envColorLeft,
					_envColorRight: customColors?._envColorRight,
					_envColorWhite: customColors?._envColorWhite,
					_envColorLeftBoost: customColors?._envColorLeftBoost,
					_envColorRightBoost: customColors?._envColorRightBoost,
					_envColorWhiteBoost: customColors?._envColorWhiteBoost,
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
					editorSettings: editorSettings,
				},
			},
		},
	});
}
export function deserializeInfoContents(data: wrapper.IWrapInfo, options: InfoDeserializationOptions): Omit<App.ISong, "id"> {
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

export function serializeBeatmapContents(data: Partial<App.IBeatmapEntities>, { editorOffsetInBeats = 0 }: BeatmapSerializationOptions) {
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
}
export function deserializeBeatmapContents(data: wrapper.IWrapBeatmap, { editorOffsetInBeats = 0 }: BeatmapDeserializationOptions): Partial<App.IBeatmapEntities> {
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
}
