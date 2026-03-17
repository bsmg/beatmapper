import { colorToHex, hexToRgba, type IV2Bookmark, type IV3Bookmark } from "bsmap";

import type { App } from "$/types";
import { hashCode } from "$/utils";
import { createEntityFactory } from "./factory.helpers";

export function resolveBookmarkId<T extends Pick<App.IBookmark, "time">>(x: T) {
	return `${x.time}`;
}

export function resolveColorForBookmark(name: string) {
	return `hsl(${Math.abs(hashCode(name)) % 360}, 70%, 50%)`;
}

export const { serialize: serializeCustomBookmark, deserialize: deserializeCustomBookmark } = createEntityFactory<App.IBookmark, { 1: Omit<IV2Bookmark, "_color">; 2: IV2Bookmark; 3: IV3Bookmark }>({
	resolveKey: (data) => {
		if ("c" in data) return 3;
		if ("_color" in data) return 2;
		return 1;
	},
	container: {
		1: {
			serialize: (data) => {
				return {
					_time: data.time,
					_name: data.name,
				};
			},
			deserialize: (data) => {
				return {
					time: data._time,
					name: data._name,
					color: resolveColorForBookmark(data._name),
				};
			},
		},
		2: {
			serialize: (data) => {
				return {
					_time: data.time,
					_name: data.name,
					_color: hexToRgba(data.color),
				};
			},
			deserialize: (data) => {
				return {
					time: data._time,
					name: data._name,
					color: data._color ? colorToHex(data._color) : resolveColorForBookmark(data._name),
				};
			},
		},
		3: {
			serialize: (data) => {
				return {
					b: data.time,
					n: data.name,
					c: hexToRgba(data.color),
				};
			},
			deserialize: (data) => {
				return {
					time: data.b,
					name: data.n,
					color: data.c ? colorToHex(data.c) : resolveColorForBookmark(data.n),
				};
			},
		},
	},
});
