import type { v2 as v2t, v3 as v3t } from "bsmap/types";
import { colorToHex, hexToRgba } from "bsmap/utils";

import type { App } from "$/types";
import { random } from "$/utils";
import { createSerializationFactory } from "./serialization.helpers";

export function resolveBookmarkId<T extends Pick<App.IBookmark, "time">>(x: T) {
	return `${x.time}`;
}

export const BOOKMARK_COLORS = [
	"#F50057", // pink
	"#FFEA00", // yellow
	"#D500F9", // purple
	"#64DD17", // green
	"#0091EA", // blue
	"#FF9100", // orange
] as const;

export function getNewBookmarkColor(bookmarks: Pick<App.IBookmark, "color">[]) {
	// I have 6 unique colors, and it's important that these are the first-used colors.
	// Beyond that, we can be a little less careful, since most songs won't get up this high anyway.
	if (bookmarks.length >= 6) {
		return BOOKMARK_COLORS[bookmarks.length % BOOKMARK_COLORS.length];
	}

	const firstUnusedColor = BOOKMARK_COLORS.find((color) => {
		const isColorUnused = bookmarks.every((bookmark) => bookmark.color !== color);

		return isColorUnused;
	});

	return firstUnusedColor ?? BOOKMARK_COLORS[0];
}

type SerializationOptions = [{}, {}, {}, {}, {}];
type DeserializationOptions = [{ index?: number }, {}, {}, {}, {}];

export const { serialize: serializeCustomBookmark, deserialize: deserializeCustomBookmark } = createSerializationFactory<App.IBookmark, [Omit<v2t.IBookmark, "_color">, v2t.IBookmark, v3t.IBookmark], SerializationOptions, DeserializationOptions>("CustomBookmark", () => {
	return {
		1: {
			container: {
				serialize: (data) => {
					return {
						_time: data.time,
						_name: data.name,
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					return {
						time: data._time,
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
						_time: data.time,
						_name: data.name,
						_color: hexToRgba(data.color),
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					const color = data._color ? colorToHex(data._color) : undefined;
					return {
						time: data._time,
						name: data._name,
						color: color ?? BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
					};
				},
			},
		},
		3: {
			container: {
				serialize: (data) => {
					return {
						b: data.time,
						n: data.name,
						c: hexToRgba(data.color),
					};
				},
				deserialize: (data, { index = random(0, 5) }) => {
					const color = data.c ? colorToHex(data.c) : undefined;
					return {
						time: data.b,
						name: data.n,
						color: color ?? BOOKMARK_COLORS[index % BOOKMARK_COLORS.length],
					};
				},
			},
		},
	};
});
