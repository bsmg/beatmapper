import type { v2 as v2t, v3 as v3t } from "bsmap/types";
import { colorToHex, hexToRgba } from "bsmap/utils";

import type { App } from "$/types";
import { isColorDark, random } from "$/utils";
import { createSerializationFactory } from "./serialization.helpers";

export function resolveBookmarkId(x: Pick<App.Bookmark, "beatNum">) {
	return `${x.beatNum}`;
}

export const BOOKMARK_COLORS = [
	{ background: "#F50057", text: "white" }, // pink
	{ background: "#FFEA00", text: "black" }, // yellow
	{ background: "#D500F9", text: "white" }, // purple
	{ background: "#64DD17", text: "black" }, // green
	{ background: "#0091EA", text: "white" }, // blue
	{ background: "#FF9100", text: "black" }, // orange
] as const;

export function getNewBookmarkColor(bookmarks: Pick<App.Bookmark, "color">[]) {
	// I have 6 unique colors, and it's important that these are the first-used colors.
	// Beyond that, we can be a little less careful, since most songs won't get up this high anyway.
	if (bookmarks.length >= 6) {
		return BOOKMARK_COLORS[bookmarks.length % BOOKMARK_COLORS.length];
	}

	const firstUnusedColor = BOOKMARK_COLORS.find((color) => {
		const isColorUnused = bookmarks.every((bookmark) => bookmark.color.background !== color.background);

		return isColorUnused;
	});

	return firstUnusedColor ?? BOOKMARK_COLORS[0];
}

type SerializationOptions = [{}, {}, {}, {}, {}];
type DeserializationOptions = [{ index?: number }, {}, {}, {}, {}];

export const { serialize: serializeCustomBookmark, deserialize: deserializeCustomBookmark } = createSerializationFactory<App.Bookmark, [Omit<v2t.IBookmark, "_color">, v2t.IBookmark, v3t.IBookmark], SerializationOptions, DeserializationOptions>("CustomBookmark", () => {
	return {
		1: {
			container: {
				serialize: (data) => {
					return {
						_time: data.beatNum,
						_name: data.name,
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					return {
						beatNum: data._time,
						name: data._name,
						color: BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
					};
				},
			},
		},
		2: {
			container: {
				serialize: (data) => {
					return {
						_time: data.beatNum,
						_name: data.name,
						_color: hexToRgba(data.color.background),
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					const color = data._color ? colorToHex(data._color) : undefined;
					return {
						beatNum: data._time,
						name: data._name,
						color: color ? { background: color, text: isColorDark(color) ? "white" : "black" } : BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
					};
				},
			},
		},
		3: {
			container: {
				serialize: (data) => {
					return {
						b: data.beatNum,
						n: data.name,
						c: hexToRgba(data.color.background),
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					const color = data.c ? colorToHex(data.c) : undefined;
					return {
						beatNum: data.b,
						name: data.n,
						color: color ? { background: color, text: isColorDark(color) ? "white" : "black" } : BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
					};
				},
			},
		},
	};
});
