import type { v1 as v1t, v2 as v2t, v3 as v3t, v4 as v4t } from "bsmap/types";
import { assert, describe, expect, it } from "vitest";

import { deserializeInfoContents, serializeInfoContents } from "$/helpers/packaging.helpers";
import { resolveSongId } from "$/helpers/song.helpers";
import type { App } from "$/types";
import { resolveNoteId } from "./notes.helpers";
import { deserializeBeatmapContents, serializeBeatmapContents } from "./packaging.helpers";

describe("info serialization", () => {
	const wrapper: Omit<App.Song, "createdAt" | "lastOpenedAt"> = {
		id: resolveSongId({ name: "Ghosts 'n Stuff" }),
		songFilename: "song.ogg",
		coverArtFilename: "cover.jpg",
		name: "Ghosts 'n Stuff",
		subName: "Original Mix",
		artistName: "deadmau5",
		mapAuthorName: "Josh",
		bpm: 130,
		offset: 0,
		previewStartTime: 12,
		previewDuration: 10,
		environment: "NiceEnvironment",
		difficultiesById: {
			Hard: {
				id: "Hard",
				noteJumpSpeed: 12,
				startBeatOffset: 0,
			},
			Expert: {
				id: "Expert",
				noteJumpSpeed: 15,
				startBeatOffset: 0,
			},
		},
		modSettings: {},
	};

	describe("v1", () => {
		const v1: v1t.IInfo = {
			songName: "Ghosts 'n Stuff",
			songSubName: "Original Mix",
			authorName: "deadmau5",
			beatsPerMinute: 130,
			previewStartTime: 12,
			previewDuration: 10,
			coverImagePath: "cover.jpg",
			environmentName: "NiceEnvironment",
			oneSaber: false,
			difficultyLevels: [
				{
					characteristic: "Standard",
					difficulty: "Hard",
					difficultyRank: 6,
					audioPath: "song.ogg",
					jsonPath: "Hard.json",
				},
				{
					characteristic: "Standard",
					difficulty: "Expert",
					difficultyRank: 8,
					audioPath: "song.ogg",
					jsonPath: "Expert.json",
				},
			],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeInfoContents(1, wrapper, {})).toMatchObject(v1);
		});
		it("converts from serial to wrapper", () => {
			expect(deserializeInfoContents(1, v1, { mapAuthorName: "Josh" })).toMatchObject(wrapper);
		});
	});

	describe("v2", () => {
		const v2: v2t.IInfo = {
			_version: "2.1.0",
			_songName: "Ghosts 'n Stuff",
			_songSubName: "Original Mix",
			_songAuthorName: "deadmau5",
			_levelAuthorName: "Josh",
			_beatsPerMinute: 130,
			_songTimeOffset: 0,
			_shuffle: 0,
			_shufflePeriod: 0.5,
			_previewStartTime: 12,
			_previewDuration: 10,
			_songFilename: "song.ogg",
			_coverImageFilename: "cover.jpg",
			_environmentName: "NiceEnvironment",
			_allDirectionsEnvironmentName: "GlassDesertEnvironment",
			_environmentNames: ["NiceEnvironment"],
			_colorSchemes: [],
			_customData: {
				_editors: {
					_lastEditedBy: "Beatmapper",
					Beatmapper: {
						version: version,
					},
				},
			},
			_difficultyBeatmapSets: [
				{
					_beatmapCharacteristicName: "Standard",
					_difficultyBeatmaps: [
						{
							_difficulty: "Hard",
							_difficultyRank: 5,
							_beatmapFilename: "Hard.dat",
							_noteJumpMovementSpeed: 12,
							_noteJumpStartBeatOffset: 0,
							_beatmapColorSchemeIdx: -1,
							_environmentNameIdx: 0,
						},
						{
							_difficulty: "Expert",
							_difficultyRank: 7,
							_beatmapFilename: "Expert.dat",
							_noteJumpMovementSpeed: 15,
							_noteJumpStartBeatOffset: 0,
							_beatmapColorSchemeIdx: -1,
							_environmentNameIdx: 0,
						},
					],
				},
			],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeInfoContents(2, wrapper, {})).toMatchObject(v2);
		});
		it("converts from wrapper to serial", () => {
			expect(deserializeInfoContents(2, v2, {})).toMatchObject(wrapper);
		});
	});

	describe("v4", () => {
		const v4: v4t.IInfo = {
			version: "4.0.1",
			song: {
				title: "Ghosts 'n Stuff",
				subTitle: "Original Mix",
				author: "deadmau5",
			},
			audio: {
				songFilename: "song.ogg",
				audioDataFilename: "AudioData.dat",
				bpm: 130,
				lufs: 0,
				previewStartTime: 12,
				previewDuration: 10,
				songDuration: 0,
			},
			songPreviewFilename: "song.ogg",
			coverImageFilename: "cover.jpg",
			environmentNames: ["NiceEnvironment"],
			colorSchemes: [],
			customData: {
				_editors: {
					_lastEditedBy: "Beatmapper",
					Beatmapper: {
						version: version,
					},
				},
			},
			difficultyBeatmaps: [
				{
					beatmapDataFilename: "Hard.beatmap.dat",
					lightshowDataFilename: "Hard.lightshow.dat",
					characteristic: "Standard",
					difficulty: "Hard",
					noteJumpMovementSpeed: 12,
					noteJumpStartBeatOffset: 0,
					beatmapColorSchemeIdx: -1,
					environmentNameIdx: 0,
					beatmapAuthors: { mappers: ["Josh"], lighters: [] },
				},
				{
					beatmapDataFilename: "Expert.beatmap.dat",
					lightshowDataFilename: "Expert.lightshow.dat",
					characteristic: "Standard",
					difficulty: "Expert",
					noteJumpMovementSpeed: 15,
					noteJumpStartBeatOffset: 0,
					beatmapColorSchemeIdx: -1,
					environmentNameIdx: 0,
					beatmapAuthors: { mappers: ["Josh"], lighters: [] },
				},
			],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeInfoContents(4, wrapper, { songDuration: 0 })).toMatchObject(v4);
		});
		it("converts from wrapper to serial", () => {
			expect(deserializeInfoContents(4, v4, {})).toMatchObject(wrapper);
		});
	});

	describe("custom colors", () => {
		const customColors: App.ModSettings["customColors"] = {
			isEnabled: true,
			colorLeft: "#00FFFF",
			colorRight: "#FF00FF",
			envColorLeft: "#00FF00",
			envColorRight: "#FFFF00",
			obstacleColor: "#FF0000",
		};
		describe("v2", () => {
			const v2: v2t.IColorScheme = {
				_colorLeft: { r: 0, g: 1, b: 1 },
				_colorRight: { r: 1, g: 0, b: 1 },
				_envColorLeft: { r: 0, g: 1, b: 0 },
				_envColorRight: { r: 1, g: 1, b: 0 },
				_obstacleColor: { r: 1, g: 0, b: 0 },
			};
			it("converts from wrapper to serial", () => {
				const converted = serializeInfoContents(
					2,
					{
						...wrapper,
						modSettings: { customColors: { ...customColors, isEnabled: true } },
					},
					{},
				);
				assert(converted._difficultyBeatmapSets?.[0]._difficultyBeatmaps);
				for (const difficulty of converted._difficultyBeatmapSets[0]._difficultyBeatmaps) {
					expect(difficulty._customData).toMatchObject(v2);
				}
			});
			it("does not convert when disabled", () => {
				const converted = serializeInfoContents(2, { ...wrapper, modSettings: { customColors: { ...customColors, isEnabled: false } } }, {});
				assert(converted._difficultyBeatmapSets?.[0]._difficultyBeatmaps);
				for (const difficulty of converted._difficultyBeatmapSets[0]._difficultyBeatmaps) {
					expect(difficulty._customData).toMatchObject({});
				}
			});
		});
	});
});

describe("beatmap entities serialization", () => {
	const wrapper: Partial<App.BeatmapEntities> = {
		bombs: [
			{ id: resolveNoteId({ beatNum: 4, colIndex: 0, rowIndex: 2 }), beatNum: 4, colIndex: 0, rowIndex: 2 },
			{ id: resolveNoteId({ beatNum: 8, colIndex: 0, rowIndex: 2 }), beatNum: 8, colIndex: 0, rowIndex: 2 },
		],
	};
	describe("v1", () => {
		const v1: v1t.IDifficulty = {
			_version: "1.5.0",
			_beatsPerMinute: 120,
			_beatsPerBar: 4,
			_shuffle: 0,
			_shufflePeriod: 0,
			_noteJumpSpeed: 10,
			_noteJumpStartBeatOffset: 0,
			_notes: [
				{ _time: 4, _lineIndex: 0, _lineLayer: 2, _type: 3, _cutDirection: 0 },
				{ _time: 8, _lineIndex: 0, _lineLayer: 2, _type: 3, _cutDirection: 0 },
			],
			_events: [],
			_obstacles: [],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeBeatmapContents(1, wrapper, {})).toMatchObject({ difficulty: v1 });
		});
		it("converts from serial to wrapper", () => {
			expect(deserializeBeatmapContents(1, { difficulty: v1, lightshow: undefined }, {})).toMatchObject(wrapper);
		});
	});
	describe("v2", () => {
		const v2: v2t.IDifficulty = {
			_version: "2.6.0",
			_notes: [
				{ _time: 4, _lineIndex: 0, _lineLayer: 2, _type: 3, _cutDirection: 0 },
				{ _time: 8, _lineIndex: 0, _lineLayer: 2, _type: 3, _cutDirection: 0 },
			],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeBeatmapContents(2, wrapper, {})).toMatchObject({ difficulty: v2 });
		});
		it("converts from serial to wrapper", () => {
			expect(deserializeBeatmapContents(2, { difficulty: v2, lightshow: undefined }, {})).toMatchObject(wrapper);
		});
	});
	describe("v3", () => {
		const v3: v3t.IDifficulty = {
			version: "3.3.0",
			bombNotes: [
				{ b: 4, x: 0, y: 2 },
				{ b: 8, x: 0, y: 2 },
			],
		};
		it("converts from wrapper to serial", () => {
			expect(serializeBeatmapContents(3, wrapper, {})).toMatchObject({ difficulty: v3 });
		});
		it("converts from serial to wrapper", () => {
			expect(deserializeBeatmapContents(3, { difficulty: v3, lightshow: {} }, {})).toMatchObject(wrapper);
		});
	});
	describe("v4", () => {
		const v4: { difficulty: v4t.IDifficulty; lightshow: v4t.ILightshow } = {
			difficulty: {
				version: "4.0.0",
				bombNotes: [
					{ b: 4, i: 0 },
					{ b: 8, i: 0 },
				],
				bombNotesData: [{ x: 0, y: 2 }],
			},
			lightshow: {
				version: "4.0.0",
			},
		};
		it("converts from wrapper to serial", () => {
			expect(serializeBeatmapContents(4, wrapper, {})).toMatchObject(v4);
		});
		it("converts from serial to wrapper", () => {
			expect(deserializeBeatmapContents(4, v4, {})).toMatchObject(wrapper);
		});
	});
});
