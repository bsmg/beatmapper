import { ColorScheme, EnvironmentSchemeName, createBeatmap, createInfo, createInfoBeatmap } from "bsmap";
import type { EnvironmentAllName, IColor, v2, wrapper } from "bsmap/types";
import { colorToHex } from "bsmap/utils";

import type { Accept, App, ColorSchemeKey, IColorScheme, IEntityMap } from "$/types";
import { deepAssign, distinct, ensureObject, hasKeys } from "$/utils";
import { deserializeCustomBookmark } from "./bookmarks.helpers";
import { serializeColorElement } from "./colors.helpers";
import type { BeatmapEntitySerializationOptions, LightshowEntitySerializationOptions } from "./object.helpers";
import { getBeatmaps, getCustomColorsModule, getExtensionsModule, isModuleEnabled, resolveBeatmapIdFromFilename, resolveLightshowIdFromFilename } from "./song.helpers";

function coalesceBeatmapCollection(data: App.ISong) {
	const beatmaps = getBeatmaps(data);

	// Has this song enabled any mod support?
	const isCustomColorsEnabled = isModuleEnabled(data, "customColors");
	const isMappingExtensionsEnabled = isModuleEnabled(data, "mappingExtensions");

	const colors = isCustomColorsEnabled ? getCustomColorsModule(data) : undefined;

	const customColors = ensureObject({
		_colorLeft: colors?.colorLeft ? serializeColorElement(colors.colorLeft) : undefined,
		_colorRight: colors?.colorRight ? serializeColorElement(colors.colorRight) : undefined,
		_obstacleColor: colors?.obstacleColor ? serializeColorElement(colors.obstacleColor) : undefined,
		_envColorLeft: colors?.envColorLeft ? serializeColorElement(colors.envColorLeft) : undefined,
		_envColorRight: colors?.envColorRight ? serializeColorElement(colors.envColorRight) : undefined,
		_envColorLeftBoost: colors?.envColorLeftBoost ? serializeColorElement(colors.envColorLeftBoost) : undefined,
		_envColorRightBoost: colors?.envColorRightBoost ? serializeColorElement(colors.envColorRightBoost) : undefined,
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
	function resolveColor(data: wrapper.IWrapInfo, key: ColorSchemeKey) {
		if (data.difficulties.some((x) => hasKeys(x.customData, `_${key}`))) {
			const customColorExists = data.difficulties.find((x) => x.customData[`_${key}`]);
			const customColor = customColorExists?.customData[`_${key}`];
			if (customColor) return colorToHex(customColor).slice(0, 7);
		}
	}

	const isCustomColorsEnabled = data.difficulties.some((beatmap) => hasKeys(beatmap.customData, "_colorLeft", "_colorRight", "_envColorLeft", "_envColorRight", "_envColorLeftBoost", "_envColorRightBoost", "_obstacleColor"));
	const isMappingExtensionsEnabled = data.difficulties.some((beatmap) => beatmap.customData._requirements?.includes("Mapping Extensions"));

	const customColors = {
		...data.customData.editors?.Beatmapper?.editorSettings?.modSettings?.customColors,
		isEnabled: isCustomColorsEnabled,
		colorLeft: resolveColor(data, "colorLeft"),
		colorRight: resolveColor(data, "colorRight"),
		envColorLeft: resolveColor(data, "envColorLeft"),
		envColorRight: resolveColor(data, "envColorRight"),
		envColorLeftBoost: resolveColor(data, "envColorLeftBoost"),
		envColorRightBoost: resolveColor(data, "envColorRightBoost"),
		obstacleColor: resolveColor(data, "obstacleColor"),
	};

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

	const allEnvironments = distinct(Object.values(beatmaps).map((x) => x.environmentName));

	const envColorScheme = ColorScheme[EnvironmentSchemeName[patchEnvironmentName(data.environment)]] as Required<{ [key in keyof v2.IColorScheme]: Required<IColor> }>;

	const allColorSchemes = Object.entries(data.colorSchemesById).map(([name, scheme]): wrapper.IWrapInfoColorScheme => {
		return {
			name: name,
			overrideNotes: true,
			overrideLights: true,
			saberLeftColor: serializeColorElement(scheme.colorLeft) ?? envColorScheme._colorRight,
			saberRightColor: serializeColorElement(scheme.colorRight) ?? envColorScheme._colorRight,
			environment0Color: serializeColorElement(scheme.envColorLeft) ?? envColorScheme._envColorLeft,
			environment1Color: serializeColorElement(scheme.envColorRight) ?? envColorScheme._envColorRight,
			obstaclesColor: serializeColorElement(scheme.obstacleColor) ?? envColorScheme._obstacleColor,
			environment0ColorBoost: serializeColorElement(scheme.envColorLeftBoost) ?? envColorScheme._envColorLeftBoost ?? envColorScheme._envColorLeft,
			environment1ColorBoost: serializeColorElement(scheme.envColorRightBoost) ?? envColorScheme._envColorRightBoost ?? envColorScheme._envColorRight,
		};
	});

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
					_envColorLeft: customColors?._envColorLeft,
					_envColorRight: customColors?._envColorRight,
					_obstacleColor: customColors?._obstacleColor,
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
export function deserializeInfoContents(data: wrapper.IWrapInfo, options: InfoDeserializationOptions): App.ISong {
	const colorSchemesById = data.colorSchemes.reduce((acc: IEntityMap<Required<IColorScheme>>, scheme) => {
		acc[scheme.name] = {
			colorLeft: colorToHex(scheme.saberLeftColor).slice(0, 7),
			colorRight: colorToHex(scheme.saberRightColor).slice(0, 7),
			obstacleColor: colorToHex(scheme.obstaclesColor).slice(0, 7),
			envColorLeft: colorToHex(scheme.environment0Color).slice(0, 7),
			envColorRight: colorToHex(scheme.environment1Color).slice(0, 7),
			envColorLeftBoost: colorToHex(scheme.environment0ColorBoost).slice(0, 7),
			envColorRightBoost: colorToHex(scheme.environment1ColorBoost).slice(0, 7),
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
		...(data.difficulty.customData?._bookmarks?.map((x) => deserializeCustomBookmark(2, x, {})) ?? []),
		...(data.difficulty.customData?.bookmarks?.map((x) => deserializeCustomBookmark(3, x, {})) ?? []),
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
