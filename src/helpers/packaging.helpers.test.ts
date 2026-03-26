import { createBeatmap, createColorNote, createInfo } from "bsmap";
import { describe, expect, it } from "vitest";

import type { App } from "$/types";
import { deserializeBeatmapContents, deserializeInfoContents, serializeBeatmapContents, serializeInfoContents } from "./packaging.helpers";
import { createAppSong } from "./song.helpers";

describe("info serialization", () => {
	describe(serializeInfoContents.name, () => {
		it("always injects editor settings into custom data", () => {
			const mock = createAppSong({
				name: "test",
				bpm: 120,
				songFilename: "song.ogg",
				coverArtFilename: "cover.jpg",
			});
			const result = serializeInfoContents(mock, { songDuration: 1000 });
			expect(Object.keys({ ...result.customData._editors })).toContain("Beatmapper");
			expect(result.customData._editors?._lastEditedBy).toBe("Beatmapper");
			expect(result.customData._editors?.Beatmapper).toMatchObject({ editorSettings: {} });
		});
	});
	describe(deserializeInfoContents.name, () => {
		it("assigns base environment from first available in list of overrides", () => {
			const mock = createInfo({ environmentNames: ["WeaveEnvironment"] });
			const result = deserializeInfoContents(mock, { readonly: false });
			expect(result.environment).toBe("WeaveEnvironment");
		});
		it("assigns base environment to fallback if no environments are defined", () => {
			const mock = createInfo({ environmentNames: [] });
			const result = deserializeInfoContents(mock, { readonly: false });
			expect(result.environment).toBe("DefaultEnvironment");
		});
	});
});

describe("beatmap serialization", () => {
	describe(serializeBeatmapContents.name, () => {
		it("adjusts time for all entities by editor offset", () => {
			const mock: Partial<App.IBeatmapEntities> = {
				notes: [createColorNote({ time: 10, posX: 0, posY: 0, color: 0, direction: 0 })],
			};
			const result = serializeBeatmapContents(mock, { version: 3, editorOffsetInBeats: 2 });
			expect(result.difficulty.colorNotes[0].time).toBe(12);
		});
	});
	describe(deserializeBeatmapContents.name, () => {
		it("adjusts time for all entities by editor offset", () => {
			const mock = createBeatmap({
				difficulty: { colorNotes: [{ time: 12, posX: 0, posY: 0, color: 0, direction: 0 }] },
			});
			const result = deserializeBeatmapContents(mock, {
				editorOffsetInBeats: 2,
			});
			expect(result.notes?.[0].time).toBe(10);
		});
		it("aggregates bookmarks across all formats", () => {
			const mock = createBeatmap({
				difficulty: {
					customData: {
						_bookmarks: [{ _time: 1, _name: "v2", _color: [1, 0, 0] }],
						bookmarks: [{ b: 2, n: "v3", c: [0, 1, 0] }],
					},
				},
				lightshow: {
					customData: {
						_bookmarks: [{ _time: 1, _name: "v2", _color: [1, 0, 0] }],
						bookmarks: [{ b: 2, n: "v3", c: [0, 1, 0] }],
					},
				},
				customData: {
					bookmarks: [{ time: 3, name: "Global", color: "#0000ff" }],
				},
			});
			const result = deserializeBeatmapContents(mock, {
				editorOffsetInBeats: -2,
			});
			expect(result.bookmarks).toStrictEqual([
				{ time: 3, name: "v2", color: "#ff0000" },
				{ time: 4, name: "v3", color: "#00ff00" },
				{ time: 5, name: "Global", color: "#0000ff" },
			]);
		});
	});
});
