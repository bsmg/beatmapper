import { ColorScheme, DifficultyRanking, EnvironmentSchemeName, createBeatmap, createInfo, remapDedupe, sortV2NoteFn, v1, v2, v3, v4 } from "bsmap";
import { type BeatmapFileType, CharacteristicName, DifficultyName, type DifficultyRank, type EnvironmentAllName, type EnvironmentName, type InferBeatmapSerial, type InferBeatmapVersion, type v1 as v1t, type v2 as v2t, type v4 as v4t, type wrapper } from "bsmap/types";
import { object, optional } from "valibot";

import { DEFAULT_GRID, DEFAULT_NOTE_JUMP_SPEEDS, EVENT_TRACKS } from "$/constants";
import { App, type BeatmapId, type Merge, type OrderedTuple } from "$/types";
import { withKeys as hasKeys, maybeObject } from "$/utils";
import { colorToHex } from "bsmap/utils";
import { deserializeCustomBookmark, serializeCustomBookmark } from "./bookmarks.helpers";
import { formatColorForMods } from "./colors.helpers";
import { deserializeBasicEvent, deserializeWrapBasicEvent, serializeBasicEvent, serializeWrapBasicEvent } from "./events.helpers";
import { deserializeBombNote, deserializeColorNote, deserializeWrapBombNote, deserializeWrapColorNote, serializeBombNote, serializeColorNote, serializeWrapBombNote, serializeWrapColorNote } from "./notes.helpers";
import type { BeatmapEntitySerializationOptions, LightshowEntitySerializationOptions } from "./object.helpers";
import { deserializeObstacle, deserializeWrapObstacle, serializeObstacle, serializeWrapObstacle } from "./obstacles.helpers";
import { type ImplicitVersion, createSerializationFactory } from "./serialization.helpers";
import { resolveBeatmapIdFromFilename, resolveSongId, sortBeatmaps } from "./song.helpers";

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

export type InferBeatmapSerialForType<TFileType extends BeatmapFileType, TVersion extends ImplicitVersion> = TVersion extends InferBeatmapVersion<TFileType> ? InferBeatmapSerial<TFileType, TVersion> : undefined;

export type InferBeatmapSerials<TFileType extends BeatmapFileType> = {
	[TVersion in ImplicitVersion]: InferBeatmapSerialForType<TFileType, TVersion>;
} extends infer O extends Record<ImplicitVersion, InferBeatmapSerialForType<TFileType, ImplicitVersion>>
	? OrderedTuple<O, [1, 2, 3, 4]>
	: never;

export type PickInferBeatmapSerials<TFileType extends BeatmapFileType> = OrderedTuple<{ [index in 0 | 1 | 2 | 3]: { [K in TFileType]: InferBeatmapSerials<K>[index] } }, [0, 1, 2, 3]>;

export type PickBeatmapSerials<TFileType extends BeatmapFileType> = PickInferBeatmapSerials<TFileType>[0 | 1 | 2 | 3];

type InfoSerializationOptions = OrderedTuple<
	{
		0: {};
		1: {};
		2: {};
		3: {};
		4: { songDuration?: number };
	},
	[0, 1, 2, 3, 4]
>;

type InfoDeserializationOptions = OrderedTuple<
	{
		0: {};
		1: { mapAuthorName: string };
		2: {};
		3: {};
		4: {};
	},
	[0, 1, 2, 3, 4]
>;

export type InferInfoSerializationOptions<T extends ImplicitVersion = ImplicitVersion> = Merge<InfoSerializationOptions[0], InfoSerializationOptions[T]>;
export type InferInfoDeserializationOptions<T extends ImplicitVersion = ImplicitVersion> = Merge<InfoDeserializationOptions[0], InfoDeserializationOptions[T]>;

function coalesceBeatmapCollection(data: App.Song) {
	const beatmaps = Object.values(data.difficultiesById).sort(sortBeatmaps);

	// Has this song enabled any mod support?
	const enabledCustomColors = !!data.modSettings?.customColors?.isEnabled;
	const mappingExtensionsEnabled = !!data.modSettings?.mappingExtensions?.isEnabled;

	const requirements: string[] = [];
	if (mappingExtensionsEnabled) {
		requirements.push("Mapping Extensions");
	}

	const colors = enabledCustomColors ? data.modSettings?.customColors : undefined;

	const customColors = maybeObject({
		_colorLeft: colors?.colorLeft ? formatColorForMods(App.BeatmapColorKey.SABER_LEFT, colors.colorLeft, colors.colorLeftOverdrive) : undefined,
		_colorRight: colors?.colorRight ? formatColorForMods(App.BeatmapColorKey.SABER_RIGHT, colors.colorRight, colors.colorRightOverdrive) : undefined,
		_envColorLeft: colors?.envColorLeft ? formatColorForMods(App.BeatmapColorKey.ENV_LEFT, colors.envColorLeft, colors.envColorLeftOverdrive) : undefined,
		_envColorRight: colors?.envColorRight ? formatColorForMods(App.BeatmapColorKey.ENV_RIGHT, colors.envColorRight, colors.envColorRightOverdrive) : undefined,
		_obstacleColor: colors?.obstacleColor ? formatColorForMods(App.BeatmapColorKey.OBSTACLE, colors.obstacleColor, colors.obstacleColorOverdrive) : undefined,
	});

	const editorSettings = {
		enabledFastWalls: data.enabledFastWalls,
		modSettings: maybeObject(data.modSettings ?? {}),
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

export function serializeWrapInfoContents(data: App.Song, options: { duration?: number }) {
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
			duration: options.duration,
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
export function deserializeWrapInfoContents(data: wrapper.IWrapInfo, options: { readonly?: boolean }): App.Song {
	const beatmapsById = data.difficulties.reduce((acc: App.Song["difficultiesById"], beatmap) => {
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
		id: resolveSongId({ name: data.song.title }),
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

export const { serialize: serializeInfoContents, deserialize: deserializeInfoContents } = createSerializationFactory<App.Song, InferBeatmapSerials<"info">, InfoSerializationOptions, InfoDeserializationOptions>("Info", () => {
	return {
		1: {
			schema: v1.InfoSchema,
			container: {
				serialize: (data) => {
					const { beatmaps, customColors, editorSettings } = coalesceBeatmapCollection(data);
					return {
						songName: data.name,
						songSubName: data.subName ?? "",
						authorName: data.artistName ?? "",
						beatsPerMinute: data.bpm,
						previewStartTime: data.previewStartTime,
						previewDuration: data.previewDuration,
						coverImagePath: data.coverArtFilename,
						environmentName: data.environment,
						oneSaber: false,
						difficultyLevels: beatmaps.map((beatmap): v1t.IInfoDifficulty => {
							return {
								characteristic: beatmap.characteristic,
								difficulty: beatmap.difficulty,
								difficultyRank: (DifficultyRanking[beatmap.difficulty] + 1) as DifficultyRank,
								audioPath: data.songFilename,
								jsonPath: resolveBeatmapFilenameForImplicitVersion(1, beatmap.beatmapId, "beatmap"),
								offset: data.offset,
								customColors: editorSettings.modSettings?.customColors?.isEnabled,
								difficultyLabel: beatmap.customLabel,
								colorLeft: customColors?._colorLeft,
								colorRight: customColors?._colorRight,
								envColorLeft: customColors?._envColorLeft,
								envColorRight: customColors?._envColorRight,
								obstacleColor: customColors?._obstacleColor,
							};
						}),
					};
				},
				deserialize: (data, { mapAuthorName }) => {
					const beatmapsById = data.difficultyLevels.reduce((acc: App.Song["difficultiesById"], beatmap) => {
						const beatmapId = resolveBeatmapIdFromFilename(beatmap.jsonPath);
						acc[beatmapId] = {
							beatmapId: beatmapId,
							lightshowId: "Unnamed",
							characteristic: beatmap.characteristic,
							difficulty: beatmap.difficulty,
							noteJumpSpeed: DEFAULT_NOTE_JUMP_SPEEDS[beatmap.difficulty],
							startBeatOffset: 0,
							customLabel: beatmap.difficultyLabel,
						};
						return acc;
					}, {});

					return {
						id: resolveSongId({ name: data.songName }),
						name: data.songName,
						subName: data.songSubName,
						artistName: data.authorName,
						mapAuthorName: mapAuthorName,
						bpm: data.beatsPerMinute,
						offset: data.difficultyLevels[0].offset ?? 0,
						previewStartTime: data.previewStartTime,
						previewDuration: data.previewDuration,
						environment: data.environmentName,
						songFilename: data.difficultyLevels[0].audioPath,
						coverArtFilename: data.coverImagePath,
						difficultiesById: beatmapsById,
						modSettings: {},
					};
				},
			},
		},
		2: {
			schema: v2.InfoSchema,
			container: {
				serialize: (data) => {
					const { beatmaps, requirements, customColors, editorSettings } = coalesceBeatmapCollection(data);

					const sets: v2t.IInfoSet[] = CharacteristicName.reduce((acc, characteristic) => {
						const forCharacteristic = beatmaps.filter((x) => x.characteristic === characteristic);
						if (forCharacteristic.length === 0) return acc;
						return acc.concat({
							_beatmapCharacteristicName: characteristic,
							_difficultyBeatmaps: forCharacteristic.map((beatmap) => ({
								_difficulty: beatmap.difficulty,
								_difficultyRank: DifficultyRanking[beatmap.difficulty],
								_beatmapFilename: resolveBeatmapFilenameForImplicitVersion(2, beatmap.beatmapId, "beatmap"),
								_noteJumpMovementSpeed: beatmap.noteJumpSpeed,
								_noteJumpStartBeatOffset: beatmap.startBeatOffset,
								_beatmapColorSchemeIdx: -1,
								_environmentNameIdx: 0,
								_customData: maybeObject({
									_editorOffset: data.offset !== 0 ? data.offset : undefined,
									_requirements: requirements.length > 1 ? requirements : undefined,
									_difficultyLabel: beatmap.customLabel && beatmap.customLabel.length > 0 ? beatmap.customLabel : undefined,
									...customColors,
								}),
							})),
						});
					}, [] as v2t.IInfoSet[]);

					if (data.enabledLightshow) {
						sets.push({
							_beatmapCharacteristicName: "Lightshow",
							_difficultyBeatmaps: [
								{
									_difficulty: DifficultyName[0],
									_difficultyRank: 1,
									_beatmapFilename: "Lightshow.dat",
									_noteJumpMovementSpeed: 10,
									_noteJumpStartBeatOffset: 0,
									_beatmapColorSchemeIdx: -1,
									_environmentNameIdx: 0,
									_customData: maybeObject({
										_editorOffset: data.offset !== 0 ? data.offset : undefined,
										_requirements: requirements.length > 1 ? requirements : undefined,
										_difficultyLabel: "Lightshow",
										...customColors,
									}),
								},
							],
						});
					}

					return {
						_version: "2.1.0",
						_songName: data.name,
						_songSubName: data.subName ?? "",
						_songAuthorName: data.artistName,
						_levelAuthorName: data.mapAuthorName ?? "",
						_beatsPerMinute: data.bpm,
						_songTimeOffset: 0,
						_shuffle: 0,
						_shufflePeriod: 0.5,
						_previewStartTime: data.previewStartTime,
						_previewDuration: data.previewDuration,
						_songFilename: data.songFilename,
						_coverImageFilename: data.coverArtFilename,
						_environmentName: data.environment,
						_allDirectionsEnvironmentName: "GlassDesertEnvironment",
						_environmentNames: [data.environment],
						_colorSchemes: [],
						_difficultyBeatmapSets: sets,
						_customData: {
							_editors: {
								_lastEditedBy: "Beatmapper",
								Beatmapper: {
									version: version,
									editorSettings: maybeObject(editorSettings),
								},
							},
						},
					};
				},
				deserialize: (data) => {
					const beatmapsById = data._difficultyBeatmapSets.reduce((acc: App.Song["difficultiesById"], set) => {
						for (const beatmap of set._difficultyBeatmaps) {
							const beatmapId = resolveBeatmapIdFromFilename(beatmap._beatmapFilename);
							acc[beatmapId] = {
								beatmapId: beatmapId,
								lightshowId: "Unnamed",
								characteristic: set._beatmapCharacteristicName,
								difficulty: beatmap._difficulty,
								noteJumpSpeed: beatmap._noteJumpMovementSpeed,
								startBeatOffset: beatmap._noteJumpStartBeatOffset,
								customLabel: beatmap._customData?._difficultyLabel,
							};
						}
						return acc;
					}, {});

					const wasCreatedInBeatmapper = data._customData?._editors?._lastEditedBy === "Beatmapper";

					const persistedData = !!data._customData?._editors?.Beatmapper && wasCreatedInBeatmapper ? (data._customData._editors.Beatmapper as App.EditorInfoData).editorSettings : {};

					return {
						id: resolveSongId({ name: data._songName }),
						name: data._songName,
						subName: data._songSubName,
						artistName: data._songAuthorName,
						mapAuthorName: data._levelAuthorName,
						bpm: data._beatsPerMinute,
						offset: data._difficultyBeatmapSets[0]._difficultyBeatmaps[0]._customData?._editorOffset ?? 0,
						swingAmount: data._shuffle,
						swingPeriod: data._shufflePeriod,
						previewStartTime: data._previewStartTime,
						previewDuration: data._previewDuration,
						environment: data._environmentName,
						songFilename: data._songFilename,
						coverArtFilename: data._coverImageFilename,
						difficultiesById: beatmapsById,
						modSettings: persistedData?.modSettings ?? {},
						enabledFastWalls: persistedData?.enabledFastWalls,
						enabledLightshow: persistedData?.enabledLightshow,
					};
				},
			},
		},
		4: {
			schema: v4.InfoSchema,
			container: {
				serialize: (data, { songDuration = 0 }) => {
					const { beatmaps, requirements, customColors, editorSettings } = coalesceBeatmapCollection(data);
					return {
						version: "4.0.1",
						song: {
							title: data.name,
							subTitle: data.subName ?? "",
							author: data.artistName,
						},
						audio: {
							songFilename: data.songFilename,
							audioDataFilename: "AudioData.dat",
							bpm: data.bpm,
							lufs: 0,
							previewStartTime: data.previewStartTime,
							previewDuration: data.previewDuration,
							songDuration: songDuration,
						},
						songPreviewFilename: data.songFilename,
						coverImageFilename: data.coverArtFilename,
						colorSchemes: [],
						environmentNames: [data.environment as EnvironmentAllName],
						difficultyBeatmaps: beatmaps.map((beatmap) => {
							return {
								beatmapDataFilename: resolveBeatmapFilenameForImplicitVersion(4, beatmap.beatmapId, "beatmap"),
								lightshowDataFilename: resolveBeatmapFilenameForImplicitVersion(4, beatmap.lightshowId, "lightshow"),
								characteristic: beatmap.characteristic,
								difficulty: beatmap.difficulty,
								noteJumpMovementSpeed: beatmap.noteJumpSpeed,
								noteJumpStartBeatOffset: beatmap.startBeatOffset,
								beatmapColorSchemeIdx: -1,
								environmentNameIdx: 0,
								beatmapAuthors: {
									mappers: data.mapAuthorName ? [data.mapAuthorName] : [],
									lighters: [],
								},
								customData: maybeObject({
									_editorOffset: data.offset !== 0 ? data.offset : undefined,
									_requirements: requirements.length > 0 ? requirements : undefined,
									_difficultyLabel: beatmap.customLabel && beatmap.customLabel.length > 0 ? beatmap.customLabel : undefined,
									...customColors,
								}),
							};
						}),
						customData: {
							_editors: {
								_lastEditedBy: "Beatmapper",
								Beatmapper: {
									version: version,
									editorSettings: maybeObject(editorSettings),
								},
							},
						},
					};
				},
				deserialize: (data) => {
					const beatmapsById = data.difficultyBeatmaps.reduce((acc: App.Song["difficultiesById"], beatmap) => {
						const beatmapId = resolveBeatmapIdFromFilename(beatmap.beatmapDataFilename);
						const lightshowId = resolveBeatmapIdFromFilename(beatmap.lightshowDataFilename);
						acc[beatmapId] = {
							beatmapId: beatmapId,
							lightshowId: lightshowId,
							characteristic: beatmap.characteristic,
							difficulty: beatmap.difficulty,
							noteJumpSpeed: beatmap.noteJumpMovementSpeed,
							startBeatOffset: beatmap.noteJumpStartBeatOffset,
							customLabel: beatmap.customData?._difficultyLabel,
						};
						return acc;
					}, {});

					return {
						id: resolveSongId({ name: data.song.title }),
						name: data.song.title,
						subName: data.song.subTitle,
						artistName: data.song.author,
						mapAuthorName: data.difficultyBeatmaps[0].beatmapAuthors.mappers[0],
						bpm: data.audio.bpm,
						offset: data.difficultyBeatmaps[0].customData?._editorOffset ?? 0,
						previewStartTime: data.audio.previewStartTime,
						previewDuration: data.audio.previewDuration,
						environment: data.environmentNames[0] as EnvironmentName,
						songFilename: data.audio.songFilename,
						coverArtFilename: data.coverImageFilename,
						difficultiesById: beatmapsById,
						modSettings: {},
					};
				},
			},
		},
	};
});

type BeatmapSerializationOptions = OrderedTuple<
	{
		0: BeatmapEntitySerializationOptions<"mapping-extensions"> &
			LightshowEntitySerializationOptions & {
				editorOffsetInBeats?: number;
			};
		1: {
			beatsPerMinute?: number;
			beatsPerBar?: number;
			swingAmount?: number;
			swingPeriod?: number;
			jumpSpeed?: number;
			jumpOffset?: number;
		};
		2: {};
		3: {};
		4: {};
	},
	[0, 1, 2, 3, 4]
>;

type BeatmapDeserializationOptions = OrderedTuple<
	{
		0: BeatmapEntitySerializationOptions<"mapping-extensions"> &
			LightshowEntitySerializationOptions & {
				editorOffsetInBeats?: number;
			};
		1: {};
		2: {};
		3: {};
		4: {};
	},
	[0, 1, 2, 3, 4]
>;

export type InferBeatmapSerializationOptions<T extends ImplicitVersion = ImplicitVersion> = Merge<BeatmapSerializationOptions[0], BeatmapSerializationOptions[T]>;
export type InferBeatmapDeserializationOptions<T extends ImplicitVersion = ImplicitVersion> = Merge<BeatmapDeserializationOptions[0], BeatmapDeserializationOptions[T]>;

function shiftByOffset<T extends { beatNum: number }>(options: { editorOffsetInBeats: number }) {
	return (item: T) => ({ ...item, beatNum: item.beatNum + options.editorOffsetInBeats }) as T;
}

export function serializeWrapBeatmapContents(data: Partial<App.BeatmapEntities>, { editorOffsetInBeats = 0, extensionsProvider, tracks = EVENT_TRACKS }: InferBeatmapSerializationOptions) {
	const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeWrapColorNote(x, { extensionsProvider }));
	const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeWrapBombNote(x, { extensionsProvider }));
	const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeWrapObstacle(x, { extensionsProvider }));
	const events = data.events?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeWrapBasicEvent(x, { tracks }));
	const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats }));

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
export function deserializeWrapBeatmapContents(data: wrapper.IWrapBeatmap, { editorOffsetInBeats = 0, extensionsProvider, tracks = EVENT_TRACKS }: InferBeatmapDeserializationOptions) {
	const notes = data.difficulty.colorNotes.map((x) => deserializeWrapColorNote(x, { extensionsProvider }));
	const bombs = data.difficulty.bombNotes.map((x) => deserializeWrapBombNote(x, { extensionsProvider }));
	const obstacles = data.difficulty.obstacles.map((x) => deserializeWrapObstacle(x, { extensionsProvider }));
	const events = data.lightshow.basicEvents.map((x) => deserializeWrapBasicEvent(x, { tracks }));
	const bookmarks = data.difficulty.customData?.bookmarks?.map((x) => deserializeCustomBookmark(3, x, {}));

	return {
		notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
		bookmarks: bookmarks?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
	};
}

export const { serialize: serializeBeatmapContents, deserialize: deserializeBeatmapContents } = createSerializationFactory<Partial<App.BeatmapEntities>, PickInferBeatmapSerials<"difficulty" | "lightshow">, BeatmapSerializationOptions, BeatmapDeserializationOptions>("Beatmap", () => {
	function remapObjectContainers<T extends { object: v4t.IObject; data: unknown }>(objects: T[]) {
		const [newData, remap] = remapDedupe(objects.map((x) => x.data));
		return [objects.map((container, i) => ({ ...container.object, i: remap.get(i) ?? 0 })), newData] as [objects: T["object"][], data: T["data"][]];
	}
	return {
		1: {
			schema: object({ difficulty: v1.DifficultySchema, lightshow: optional(object({})) }),
			container: {
				serialize: (data, { editorOffsetInBeats = 0, tracks, beatsPerMinute, beatsPerBar, swingAmount, swingPeriod, jumpSpeed, jumpOffset }) => {
					const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeColorNote(1, x, {}));
					const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBombNote(1, x, {}));
					const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeObstacle(1, x, {}));
					const events = data.events?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBasicEvent(1, x, { tracks }));
					const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeCustomBookmark(1, x, {}));
					return {
						difficulty: {
							_version: "1.5.0",
							_beatsPerMinute: beatsPerMinute ?? 120,
							_beatsPerBar: beatsPerBar ?? 4,
							_shuffle: swingAmount ?? 0,
							_shufflePeriod: swingPeriod ?? 0,
							_noteJumpSpeed: jumpSpeed ?? 10,
							_noteJumpStartBeatOffset: jumpOffset ?? 0,
							_notes: [...(notes ?? []), ...(bombs ?? [])].sort(sortV2NoteFn),
							_obstacles: obstacles ?? [],
							_events: events ?? [],
							_bookmarks: bookmarks,
						},
						lightshow: undefined,
					};
				},
				deserialize: (data, { editorOffsetInBeats = 0, tracks }) => {
					const notes = data.difficulty._notes?.filter((x) => [0, 1].includes(x._type)).map((x) => deserializeColorNote(1, x, {}));
					const bombs = data.difficulty._notes?.filter((x) => [3].includes(x._type)).map((x) => deserializeBombNote(1, x, {}));
					const obstacles = data.difficulty._obstacles?.map((x) => deserializeObstacle(1, x, {}));
					const events = data.difficulty._events?.map((x) => deserializeBasicEvent(1, x, { tracks }));
					const bookmarks = data.difficulty._bookmarks?.map((x) => deserializeCustomBookmark(1, x, {}));
					return {
						notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bookmarks: bookmarks?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
					};
				},
			},
		},
		2: {
			schema: object({ difficulty: v2.DifficultySchema, lightshow: optional(object({})) }),
			container: {
				serialize: (data, { editorOffsetInBeats = 0, extensionsProvider, tracks }) => {
					const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeColorNote(2, x, { extensionsProvider }));
					const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBombNote(2, x, { extensionsProvider }));
					const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeObstacle(2, x, { extensionsProvider }));
					const events = data.events?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBasicEvent(2, x, { tracks }));
					const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeCustomBookmark(2, x, {}));
					return {
						difficulty: {
							_version: "2.6.0",
							_notes: [...(notes ?? []), ...(bombs ?? [])].sort(sortV2NoteFn),
							_obstacles: obstacles ?? [],
							_events: events ?? [],
							_waypoints: [],
							_specialEventsKeywordFilters: { _keywords: [] },
							_sliders: [],
							_customData: maybeObject({ _bookmarks: bookmarks }),
						},
						lightshow: undefined,
					};
				},
				deserialize: (data, { editorOffsetInBeats = 0, extensionsProvider, tracks }) => {
					const notes = data.difficulty._notes?.filter((x) => [0, 1].includes(x._type ?? 0)).map((x) => deserializeColorNote(2, x, { extensionsProvider }));
					const bombs = data.difficulty._notes?.filter((x) => [3].includes(x._type ?? 0)).map((x) => deserializeBombNote(2, x, { extensionsProvider }));
					const obstacles = data.difficulty._obstacles?.map((x) => deserializeObstacle(2, x, { extensionsProvider }));
					const events = data.difficulty._events?.map((x) => deserializeBasicEvent(2, x, { tracks }));
					const bookmarks = data.difficulty._customData?._bookmarks?.map((x) => deserializeCustomBookmark(2, x, {}));
					return {
						notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bookmarks: bookmarks?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
					};
				},
			},
		},
		3: {
			schema: object({ difficulty: v3.DifficultySchema, lightshow: optional(object({})) }),
			container: {
				serialize: (data, { editorOffsetInBeats = 0, extensionsProvider, tracks }) => {
					const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeColorNote(3, x, { extensionsProvider }));
					const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBombNote(3, x, { extensionsProvider }));
					const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeObstacle(3, x, { extensionsProvider }));
					const events = data.events?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBasicEvent(3, x, { tracks }));
					const bookmarks = data.bookmarks?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeCustomBookmark(3, x, {}));
					return {
						difficulty: {
							version: "3.3.0",
							colorNotes: notes ?? [],
							bombNotes: bombs ?? [],
							obstacles: obstacles ?? [],
							sliders: [],
							burstSliders: [],
							waypoints: [],
							basicBeatmapEvents: events ?? [],
							colorBoostBeatmapEvents: [],
							rotationEvents: [],
							bpmEvents: [],
							lightColorEventBoxGroups: [],
							lightRotationEventBoxGroups: [],
							lightTranslationEventBoxGroups: [],
							vfxEventBoxGroups: [],
							_fxEventsCollection: { _fl: [], _il: [] },
							basicEventTypesWithKeywords: { d: [] },
							useNormalEventsAsCompatibleEvents: true,
							customData: maybeObject({ _bookmarks: bookmarks }),
						},
						lightshow: {},
					};
				},
				deserialize: (data, { editorOffsetInBeats = 0, extensionsProvider, tracks }) => {
					const notes = data.difficulty.colorNotes?.map((x) => deserializeColorNote(3, x, { extensionsProvider }));
					const bombs = data.difficulty.bombNotes?.map((x) => deserializeBombNote(3, x, { extensionsProvider }));
					const obstacles = data.difficulty.obstacles?.map((x) => deserializeObstacle(3, x, { extensionsProvider }));
					const events = data.difficulty.basicBeatmapEvents?.map((x) => deserializeBasicEvent(3, x, { tracks }));
					const bookmarks = data.difficulty.customData?.bookmarks?.map((x) => deserializeCustomBookmark(3, x, {}));
					return {
						notes: notes?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bombs: bombs?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						obstacles: obstacles?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						events: events?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bookmarks: bookmarks?.map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
					};
				},
			},
		},
		4: {
			schema: object({ difficulty: v4.DifficultySchema, lightshow: v4.LightshowSchema }),
			container: {
				serialize: (data, { editorOffsetInBeats = 0, tracks }) => {
					const notes = data.notes?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeColorNote(4, x, {}));
					const bombs = data.bombs?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBombNote(4, x, {}));
					const obstacles = data.obstacles?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeObstacle(4, x, {}));
					const events = data.events?.map(shiftByOffset({ editorOffsetInBeats })).map((x) => serializeBasicEvent(4, x, { tracks }));

					const [colorNotes, colorNotesData] = remapObjectContainers(notes ?? []);
					const [bombNotes, bombNotesData] = remapObjectContainers(bombs ?? []);
					const [obstaclesObjects, obstaclesData] = remapObjectContainers(obstacles ?? []);
					const [basicEvents, basicEventsData] = remapObjectContainers(events ?? []);

					return {
						difficulty: {
							version: "4.0.0",
							colorNotes: colorNotes,
							colorNotesData: colorNotesData,
							bombNotes: bombNotes,
							bombNotesData: bombNotesData,
							obstacles: obstaclesObjects,
							obstaclesData: obstaclesData,
						} as v4t.IDifficulty,
						lightshow: {
							version: "4.0.0",
							basicEvents: basicEvents,
							basicEventsData: basicEventsData,
						} as v4t.ILightshow,
					};
				},
				deserialize: (data, { editorOffsetInBeats = 0, tracks }) => {
					const notes = (data.difficulty?.colorNotes ?? []).map((x) => ({ object: x, data: (data.difficulty?.colorNotesData ?? [])[x.i ?? 0] }));
					const bombs = (data.difficulty?.bombNotes ?? []).map((x) => ({ object: x, data: (data.difficulty?.bombNotesData ?? [])[x.i ?? 0] }));
					const obstacles = (data.difficulty?.obstacles ?? []).map((x) => ({ object: x, data: (data.difficulty?.obstaclesData ?? [])[x.i ?? 0] }));
					const events = (data.lightshow?.basicEvents ?? []).map((x) => ({ object: x, data: (data.lightshow?.basicEventsData ?? [])[x.i ?? 0] }));
					return {
						notes: notes.map((x) => deserializeColorNote(4, x, {})).map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						bombs: bombs.map((x) => deserializeBombNote(4, x, {})).map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						obstacles: obstacles.map((x) => deserializeObstacle(4, x, {})).map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
						events: events.map((x) => deserializeBasicEvent(4, x, { tracks })).map(shiftByOffset({ editorOffsetInBeats: -editorOffsetInBeats })),
					};
				},
			},
		},
	};
});
