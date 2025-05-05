import { remapDedupe, sortV2NoteFn, v1, v2, v3, v4 } from "bsmap";
import { type BeatmapFileType, DifficultyName, type DifficultyRank, type EnvironmentAllName, type EnvironmentName, type InferBeatmapSerial, type InferBeatmapVersion, type v1 as v1t, type v2 as v2t, type v4 as v4t } from "bsmap/types";
import { object, optional } from "valibot";

import { DEFAULT_NOTE_JUMP_SPEEDS } from "$/constants";
import { App, type Merge, type OrderedTuple } from "$/types";
import { maybeObject } from "$/utils";
import { deserializeCustomBookmark, serializeCustomBookmark } from "./bookmarks.helpers";
import { formatColorForMods } from "./colors.helpers";
import { deserializeBasicEvent, serializeBasicEvent } from "./events.helpers";
import { deserializeBombNote, deserializeColorNote, serializeBombNote, serializeColorNote } from "./notes.helpers";
import type { BeatmapEntitySerializationOptions, LightshowEntitySerializationOptions } from "./object.helpers";
import { deserializeObstacle, serializeObstacle } from "./obstacles.helpers";
import { type ImplicitVersion, createSerializationFactory } from "./serialization.helpers";
import { resolveBeatmapId, resolveDifficulty, resolveRankForDifficulty, resolveSongId, sortBeatmapIds } from "./song.helpers";

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

export const { serialize: serializeInfoContents, deserialize: deserializeInfoContents } = createSerializationFactory<App.Song, InferBeatmapSerials<"info">, InfoSerializationOptions, InfoDeserializationOptions>("Info", () => {
	function coalesceBeatmapCollection(data: App.Song) {
		const beatmapIds = sortBeatmapIds(Object.keys(data.difficultiesById));
		const beatmaps = beatmapIds.map((id) => data.difficultiesById[id]);

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
							const difficulty = resolveDifficulty(beatmap.id);
							return {
								characteristic: "Standard",
								difficulty: beatmap.id as DifficultyName,
								difficultyRank: (resolveRankForDifficulty(difficulty) + 1) as DifficultyRank,
								audioPath: data.songFilename,
								jsonPath: `${beatmap.id}.json`,
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
						const id = resolveBeatmapId(beatmap.jsonPath);
						acc[id] = {
							id,
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

					const sets: v2t.IInfoSet[] = [
						{
							_beatmapCharacteristicName: "Standard",
							_difficultyBeatmaps: beatmaps.map((beatmap): v2t.IInfoDifficulty => {
								const difficulty = resolveDifficulty(beatmap.id);
								return {
									_difficulty: beatmap.id as DifficultyName,
									_difficultyRank: resolveRankForDifficulty(difficulty),
									_beatmapFilename: `${beatmap.id}.dat`,
									_noteJumpMovementSpeed: beatmap.noteJumpSpeed,
									_noteJumpStartBeatOffset: beatmap.startBeatOffset,
									_beatmapColorSchemeIdx: -1,
									_environmentNameIdx: 0,
									_customData: maybeObject({
										_editorOffset: data.offset !== 0 ? data.offset : undefined,
										_requirements: requirements.length > 0 ? requirements : undefined,
										_difficultyLabel: beatmap.customLabel && beatmap.customLabel.length > 0 ? beatmap.customLabel : undefined,
										...customColors,
									}),
								};
							}),
						},
					];

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
					const allBeatmaps = data._difficultyBeatmapSets.filter((set) => set._beatmapCharacteristicName === "Standard");
					const beatmapsById = allBeatmaps.reduce((acc: App.Song["difficultiesById"], set) => {
						for (const beatmap of set._difficultyBeatmaps) {
							const id = resolveBeatmapId(beatmap._beatmapFilename);
							acc[id] = {
								id,
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
								beatmapDataFilename: `${beatmap.id}.beatmap.dat`,
								lightshowDataFilename: `${beatmap.id}.lightshow.dat`,
								characteristic: "Standard",
								difficulty: beatmap.id as DifficultyName,
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
						const id = resolveBeatmapId(beatmap.beatmapDataFilename);
						acc[id] = {
							id,
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

export const { serialize: serializeBeatmapContents, deserialize: deserializeBeatmapContents } = createSerializationFactory<Partial<App.BeatmapEntities>, PickInferBeatmapSerials<"difficulty" | "lightshow">, BeatmapSerializationOptions, BeatmapDeserializationOptions>("Beatmap", () => {
	function shiftByOffset<T extends { beatNum: number }>(options: { editorOffsetInBeats: number }) {
		return (item: T) => ({ ...item, beatNum: item.beatNum + options.editorOffsetInBeats }) as T;
	}

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
