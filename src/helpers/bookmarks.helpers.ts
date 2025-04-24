import type { App, Json } from "$/types";

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

export function convertBookmarksToExportableJson<T extends App.Bookmark>(bookmarks: T[]): Json.Bookmark[] {
	return (bookmarks || []).map((bookmark) => {
		return {
			_time: bookmark.beatNum,
			_name: bookmark.name,
			__meta: {
				color: bookmark.color,
			},
		};
	});
}

export function convertBookmarksToRedux<T extends Json.Bookmark>(bookmarks: T[]): App.Bookmark[] {
	return (bookmarks || []).map((bookmark, i) => {
		let color = bookmark._color ? { background: bookmark._color, text: "white" } : undefined;

		// If we're parsing bookmarks created outside of Beatmapper, we won't yet have assigned colors.
		if (!color) {
			color = BOOKMARK_COLORS[i % BOOKMARK_COLORS.length];
		}

		return {
			beatNum: bookmark._time,
			name: bookmark._name,
			color,
		};
	});
}
