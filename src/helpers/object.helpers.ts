import { NoteDirectionAngle } from "bsmap";

import type { App, IEventTracks } from "$/types";
import { clamp, roundToNearest } from "$/utils";
import { createPropertySerializationFactory } from "./serialization.helpers";

type BeatmapExtensionsProvider = string;

export interface BeatmapEntitySerializationOptions<T extends BeatmapExtensionsProvider> {
	/** The provider for which to handle extended properties. If left undefined, will parse as a vanilla property. */
	extensionsProvider?: T;
}
export interface LightshowEntitySerializationOptions {
	tracks?: IEventTracks;
}

type BeatmapExtensionsResolverMap<TWrapper, TSerial> = {
	validate: (data: TSerial) => boolean;
	serialize: (data: TWrapper) => TSerial;
	deserialize: (data: TSerial) => TWrapper;
};

type BeatmapExtensionsSerializationOptions<TProvider extends BeatmapExtensionsProvider, TWrapper, TSerial> = {
	[key in TProvider]: BeatmapExtensionsResolverMap<TWrapper, TSerial>;
};

interface CoordinateSerializationOptions<TProvider extends BeatmapExtensionsProvider, TWrapper, TSerial> {
	min?: number;
	max?: number;
	/** A map of providers to their respective serializers/deserializers. */
	extensions?: BeatmapExtensionsSerializationOptions<TProvider, TWrapper, TSerial>;
}
export function createCoordinateSerializationFactory<TProvider extends BeatmapExtensionsProvider>({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, extensions: withExtensions }: CoordinateSerializationOptions<TProvider, number, number>) {
	return createPropertySerializationFactory<number, number, BeatmapEntitySerializationOptions<TProvider>, BeatmapEntitySerializationOptions<TProvider>>(() => {
		return {
			container: {
				serialize: (index, { extensionsProvider: provider }) => {
					if (withExtensions && provider) {
						// if we're parsing a vanilla-compatible value, we should just parse it as-is for better compatibility.
						if (index >= min && index <= max && index % 1 === 0) return index;
						return withExtensions[provider].serialize(index);
					}
					if (index < min && index > max && index % 1 === 0) return index;
					// if extensions is not enabled and we get a decimal index, round it to the nearest inbounds cell.
					return clamp(Math.round(index), min, max);
				},
				deserialize: (index, { extensionsProvider: provider }) => {
					if (withExtensions && provider) {
						if (withExtensions[provider].validate(index)) return withExtensions[provider].deserialize(index);
					}
					if (index >= min && index <= max && index % 1 === 0) return index;
					throw new Error(`Invalid coordinate properties: ${index}`);
				},
			},
		};
	});
}

export const MAPPING_EXTENSIONS_INDEX_RESOLVERS: BeatmapExtensionsResolverMap<number, number> = {
	validate: (index) => index >= 1000 || index <= -1000,
	serialize: (index) => Math.round(index < 0 ? index * 1000 - 1000 : index * 1000 + 1000),
	deserialize: (index) => roundToNearest(index < 0 ? index / 1000 + 1 : index / 1000 - 1, 1 / 1000),
};
export const MAPPING_EXTENSIONS_DIMENSION_RESOLVERS: BeatmapExtensionsResolverMap<number, number> = {
	validate: (index) => index >= 1000,
	serialize: (index) => Math.round(index < 0 ? index * 1000 - 1000 : index * 1000 + 1000),
	deserialize: (index) => roundToNearest(index < 0 ? index / 1000 + 1 : index / 1000 - 1, 1 / 1000),
};
export const MAPPING_EXTENSIONS_ANGLE_RESOLVERS: BeatmapExtensionsResolverMap<{ angle: number; isDot: boolean }, Pick<App.IColorNote, "direction" | "angleOffset">> = {
	validate: ({ direction }) => (direction >= 1000 && direction <= 1360) || (direction >= 2000 && direction <= 2360),
	serialize: ({ angle, isDot }) => ({ direction: (isDot ? 2000 : 1000) + ((360 - Math.round(angle)) % 360), angleOffset: 0 }),
	deserialize: ({ direction }) => ({ angle: (-(direction % 1000) + 360) % 360, isDot: direction >= 2000 }),
};

interface AngleSerializationOptions<T extends BeatmapExtensionsProvider> {
	extensions?: BeatmapExtensionsSerializationOptions<T, { angle: number; isDot: boolean }, Pick<App.IColorNote, "direction" | "angleOffset">>;
}
export function createAngleSerializationFactory<TProvider extends BeatmapExtensionsProvider>({ extensions: withExtensions }: AngleSerializationOptions<TProvider>) {
	return createPropertySerializationFactory<{ angle: number; isDot: boolean }, Pick<App.IColorNote, "direction" | "angleOffset">, BeatmapEntitySerializationOptions<TProvider>, BeatmapEntitySerializationOptions<TProvider>>(() => {
		return {
			container: {
				serialize: (data, { extensionsProvider: provider }) => {
					if (withExtensions && provider) {
						return withExtensions[provider].serialize({ angle: data.angle % 360, isDot: data.isDot });
					}
					const step = data.isDot ? 90 : 45;
					let offset = data.angle % step;
					if (offset === step / 2) offset = -offset;
					const nearestAngle = (Math.round(data.angle / step) * step) % 360;
					const direction = data.isDot ? 8 : Object.values(NoteDirectionAngle).indexOf(nearestAngle);
					return {
						direction: direction,
						angleOffset: Math.round(offset),
					};
				},
				deserialize: (data, { extensionsProvider: provider }) => {
					if (withExtensions && provider) {
						if (withExtensions[provider].validate(data)) return withExtensions[provider].deserialize(data);
					}
					if (Object.keys(NoteDirectionAngle).includes(`${data.direction}`)) {
						return { angle: (Object.values(NoteDirectionAngle)[data.direction] + data.angleOffset) % 360, isDot: data.direction === 8 };
					}
					throw new Error("Invalid angle properties.");
				},
			},
		};
	});
}
