import { assert, describe, expect, it, vi } from "vitest";
import { createInfoContent } from "./packaging.service";
import { getDifficultyRankForDifficulty } from "./packaging.service.nitty-gritty";

const DEFAULT_SONG = {
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
			noteJumpSpeed: 14,
			startBeatOffset: 0,
		},
		Expert: {
			id: "Expert",
			noteJumpSpeed: 18,
			startBeatOffset: 0,
		},
	},
	modSettings: {},
};

vi.mock("idb", () => {
	// biome-ignore lint/suspicious/noThenProperty: valid for mocking
	return { openDB: vi.fn(() => ({ createObjectStore: vi.fn(), then: vi.fn() })) };
});

describe("packaging.service", () => {
	describe("createInfoContent", () => {
		it("Creates appropriate v1 json for default song", () => {
			const actualResult = createInfoContent(DEFAULT_SONG, { version: 1 });
			const expectedResultObj = {
				songName: DEFAULT_SONG.name,
				songSubName: DEFAULT_SONG.subName,
				authorName: DEFAULT_SONG.artistName,
				beatsPerMinute: DEFAULT_SONG.bpm,
				previewStartTime: DEFAULT_SONG.previewStartTime,
				previewDuration: DEFAULT_SONG.previewDuration,
				coverImagePath: "cover.jpg",
				environmentName: DEFAULT_SONG.environment,
				difficultyLevels: [
					{
						difficulty: "Hard",
						difficultyRank: getDifficultyRankForDifficulty({ id: "Hard" }),
						audioPath: "song.ogg",
						jsonPath: "Hard.json",
						offset: DEFAULT_SONG.offset,
						oldOffset: DEFAULT_SONG.offset,
					},
					{
						difficulty: "Expert",
						difficultyRank: getDifficultyRankForDifficulty({ id: "Expert" }),
						audioPath: "song.ogg",
						jsonPath: "Expert.json",
						offset: DEFAULT_SONG.offset,
						oldOffset: DEFAULT_SONG.offset,
					},
				],
			};
			const expectedResult = expectedResultObj;

			expect(actualResult).toEqual(expectedResult);
		});

		it("Creates appropriate v2 json for default song", () => {
			const actualResult = createInfoContent(DEFAULT_SONG, { version: 2 });
			const expectedResultObj = {
				_version: "2.0.0",
				_songName: DEFAULT_SONG.name,
				_songSubName: DEFAULT_SONG.subName,
				_songAuthorName: DEFAULT_SONG.artistName,
				_levelAuthorName: DEFAULT_SONG.mapAuthorName,
				_beatsPerMinute: DEFAULT_SONG.bpm,
				_songTimeOffset: 0,
				_shuffle: 0,
				_shufflePeriod: 0.5,
				_previewStartTime: DEFAULT_SONG.previewStartTime,
				_previewDuration: DEFAULT_SONG.previewDuration,
				_songFilename: "song.ogg",
				_coverImageFilename: "cover.jpg",
				_environmentName: DEFAULT_SONG.environment,
				_allDirectionsEnvironmentName: "GlassDesertEnvironment",
				_customData: {
					_editors: {
						_lastEditedBy: "Beatmapper",
						Beatmapper: {
							version: version,
							editorSettings: {},
						},
					},
				},
				_difficultyBeatmapSets: [
					{
						_beatmapCharacteristicName: "Standard",
						_difficultyBeatmaps: [
							{
								_difficulty: "Hard",
								_difficultyRank: getDifficultyRankForDifficulty({ id: "Hard" }),
								_beatmapFilename: "Hard.dat",
								_noteJumpMovementSpeed: DEFAULT_SONG.difficultiesById.Hard.noteJumpSpeed,
								_noteJumpStartBeatOffset: DEFAULT_SONG.difficultiesById.Hard.startBeatOffset,
								_customData: {},
							},
							{
								_difficulty: "Expert",
								_difficultyRank: getDifficultyRankForDifficulty({
									id: "Expert",
								}),
								_beatmapFilename: "Expert.dat",
								_noteJumpMovementSpeed: DEFAULT_SONG.difficultiesById.Expert.noteJumpSpeed,
								_noteJumpStartBeatOffset: DEFAULT_SONG.difficultiesById.Expert.startBeatOffset,
								_customData: {},
							},
						],
					},
				],
			};
			const expectedResult = expectedResultObj;

			expect(actualResult).toEqual(expectedResult);
		});

		it("updates custom colors correctly", () => {
			const moddedSong = {
				...DEFAULT_SONG,
				modSettings: {
					customColors: {
						isEnabled: true,
						colorLeft: "#00FFFF",
						colorRight: "#FF00FF",
						envColorLeft: "#00FF00",
						envColorRight: "#FFFF00",
						obstacleColor: "#FF0000",
					},
				},
			};

			const createdSong = createInfoContent(moddedSong, { version: 2 });

			const expectedCustomData = {
				_colorLeft: { r: 0, g: 1, b: 1 },
				_colorRight: { r: 1, g: 0, b: 1 },
				_envColorLeft: { r: 0, g: 1, b: 0 },
				_envColorRight: { r: 1, g: 1, b: 0 },
				_obstacleColor: { r: 1, g: 0, b: 0 },
			};

			assert(createdSong._difficultyBeatmapSets);
			for (const difficulty of createdSong._difficultyBeatmapSets[0]._difficultyBeatmaps) {
				expect(difficulty._customData).toEqual(expectedCustomData);
			}
		});

		it("Does not update colors when explicitly disabled", () => {
			const moddedSong = {
				...DEFAULT_SONG,
				modSettings: {
					customColors: {
						isEnabled: false,
						colorLeft: "#00FFFF",
						colorRight: "#FF00FF",
						envColorLeft: "#00FF00",
						envColorRight: "#FFFF00",
						obstacleColor: "#FF0000",
					},
				},
			};

			const createdSong = createInfoContent(moddedSong, { version: 2 });

			const expectedCustomData = {};

			assert(createdSong._difficultyBeatmapSets);
			for (const difficulty of createdSong._difficultyBeatmapSets[0]._difficultyBeatmaps) {
				expect(difficulty._customData).toEqual(expectedCustomData);
			}
		});
	});
});
