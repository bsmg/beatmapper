import { describe, expect, it } from "vitest";

import { roundToNearest } from "$/utils/number.utils.ts";
import { createAngleSerializationFactory, createCoordinateSerializationFactory } from "./object.helpers.ts";

describe("coordinate helpers", () => {
	const { serialize: serializeCoordinate, deserialize: deserializeCoordinate } = createCoordinateSerializationFactory({
		min: 0,
		max: 3,
		extensions: {
			"mapping-extensions": {
				validate: (index) => index >= 1000 || index <= -1000,
				serialize: (index) => Math.round(index < 0 ? index * 1000 - 1000 : index * 1000 + 1000),
				deserialize: (index) => roundToNearest(index < 0 ? index / 1000 + 1 : index / 1000 - 1, 1 / 1000),
			},
			"noodle-extensions": {
				validate: () => true,
				serialize: (index) => index - 1.5,
				deserialize: (index) => index + 1.5,
			},
		},
	});

	describe(serializeCoordinate.name, () => {
		it("parses vanilla", () => {
			expect(serializeCoordinate(0, {})).toEqual(0);
			expect(serializeCoordinate(3, {})).toEqual(3);
			// if extensions is enabled, parse as vanilla
			expect(serializeCoordinate(1, { extensionsProvider: "mapping-extensions" })).toEqual(1);
			expect(serializeCoordinate(1, { extensionsProvider: "noodle-extensions" })).toEqual(1);
		});
		it("parses extended grids", () => {
			// if extensions is disabled, snaps to inbounds cell
			expect(serializeCoordinate(4, {})).toEqual(3);
			expect(serializeCoordinate(-1, {})).toEqual(0);
			expect(serializeCoordinate(4, { extensionsProvider: "mapping-extensions" })).toEqual(5000);
			expect(serializeCoordinate(-1, { extensionsProvider: "mapping-extensions" })).toEqual(-2000);
			expect(serializeCoordinate(4, { extensionsProvider: "noodle-extensions" })).toEqual(2.5);
			expect(serializeCoordinate(-1, { extensionsProvider: "noodle-extensions" })).toEqual(-2.5);
		});
		it("parses precision placement", () => {
			// if extensions is disabled, round to nearest cell
			expect(serializeCoordinate(1.25, {})).toEqual(1);
			expect(serializeCoordinate(1.25, { extensionsProvider: "mapping-extensions" })).toEqual(2250);
			expect(serializeCoordinate(1.25, { extensionsProvider: "noodle-extensions" })).toEqual(-0.25);
		});
	});
	describe(deserializeCoordinate.name, () => {
		it("handles vanilla", () => {
			expect(deserializeCoordinate(1, {})).toEqual(1);
			expect(() => deserializeCoordinate(-2.75, {})).toThrow();
			expect(() => deserializeCoordinate(-1000, {})).toThrow();
		});
		it("handles mapping extensions", () => {
			expect(deserializeCoordinate(1, { extensionsProvider: "mapping-extensions" })).toEqual(1);
			expect(deserializeCoordinate(1000, { extensionsProvider: "mapping-extensions" })).toEqual(0);
			expect(deserializeCoordinate(-2250, { extensionsProvider: "mapping-extensions" })).toEqual(-1.25);
			expect(() => deserializeCoordinate(-999, { extensionsProvider: "mapping-extensions" })).toThrow();
			expect(() => deserializeCoordinate(999, { extensionsProvider: "mapping-extensions" })).toThrow();
		});
		it("handles noodle extensions", () => {
			expect(deserializeCoordinate(1, { extensionsProvider: "noodle-extensions" })).toEqual(2.5);
			expect(deserializeCoordinate(-2.75, { extensionsProvider: "noodle-extensions" })).toEqual(-1.25);
			expect(deserializeCoordinate(-1.175, { extensionsProvider: "noodle-extensions" })).toBeCloseTo(0.325);
		});
	});
});

describe("angle helpers", () => {
	const { serialize: serializeAngle, deserialize: deserializeAngle } = createAngleSerializationFactory({
		extensions: {
			// mapping extensions handles rotational offset clockwise, while other calculations run counter-clockwise
			// https://github.com/Kylemc1413/MappingExtensions/blob/master/README.md#360-degree-note-rotation
			"mapping-extensions": {
				validate: ({ direction }) => (direction >= 1000 && direction <= 1360) || (direction >= 2000 && direction <= 2360),
				serialize: ({ angle, isDot }) => ({ direction: (isDot ? 2000 : 1000) + ((360 - Math.round(angle)) % 360), offset: 0 }),
				deserialize: ({ direction }) => ({ angle: (-(direction % 1000) + 360) % 360, isDot: direction >= 2000 }),
			},
		},
	});

	describe(serializeAngle.name, () => {
		it("parses vanilla", () => {
			expect(serializeAngle({ angle: 0, isDot: false }, {})).toEqual({ direction: 1, offset: 0 });
			expect(serializeAngle({ angle: 90, isDot: false }, {})).toEqual({ direction: 3, offset: 0 });
			expect(serializeAngle({ angle: 105, isDot: false }, {})).toEqual({ direction: 3, offset: 15 });
			expect(serializeAngle({ angle: 375, isDot: false }, {})).toEqual({ direction: 1, offset: 15 });
			expect(serializeAngle({ angle: 0, isDot: true }, {})).toEqual({ direction: 8, offset: 0 });
			expect(serializeAngle({ angle: 45, isDot: true }, {})).toEqual({ direction: 8, offset: -45 });
		});
		it("parses precision rotation", () => {
			expect(serializeAngle({ angle: 5.25, isDot: false }, {})).toEqual({ direction: 1, offset: 5 });
			expect(serializeAngle({ angle: 22.5, isDot: false }, {})).toEqual({ direction: 7, offset: -22 });
			expect(serializeAngle({ angle: 5.25, isDot: false }, { extensionsProvider: "mapping-extensions" })).toEqual({ direction: 1355, offset: 0 });
			expect(serializeAngle({ angle: 22.5, isDot: false }, { extensionsProvider: "mapping-extensions" })).toEqual({ direction: 1337, offset: 0 });
			expect(serializeAngle({ angle: 5.25, isDot: true }, { extensionsProvider: "mapping-extensions" })).toEqual({ direction: 2355, offset: 0 });
		});
	});
	describe(deserializeAngle.name, () => {
		it("handles vanilla", () => {
			expect(deserializeAngle({ direction: 1, offset: 0 }, {})).toEqual({ angle: 0, isDot: false });
			expect(deserializeAngle({ direction: 3, offset: 0 }, {})).toEqual({ angle: 90, isDot: false });
			expect(deserializeAngle({ direction: 0, offset: 15 }, {})).toEqual({ angle: 195, isDot: false });
			expect(deserializeAngle({ direction: 6, offset: 50 }, {})).toEqual({ angle: 5, isDot: false });
			expect(deserializeAngle({ direction: 8, offset: 0 }, {})).toEqual({ angle: 0, isDot: true });
			expect(deserializeAngle({ direction: 8, offset: 45 }, {})).toEqual({ angle: 45, isDot: true });
			expect(() => deserializeAngle({ direction: -1, offset: 0 }, {})).toThrow();
			expect(() => deserializeAngle({ direction: 10, offset: 0 }, {})).toThrow();
			expect(() => deserializeAngle({ direction: 1000, offset: 0 }, {})).toThrow();
		});
		it("handles mapping extensions", () => {
			expect(() => deserializeAngle({ direction: 999, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toThrow();
			expect(() => deserializeAngle({ direction: 1361, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toThrow();
			expect(deserializeAngle({ direction: 1000, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toEqual({ angle: 0, isDot: false });
			expect(deserializeAngle({ direction: 1090, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toEqual({ angle: 270, isDot: false });
			expect(deserializeAngle({ direction: 2000, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toEqual({ angle: 0, isDot: true });
			expect(deserializeAngle({ direction: 2090, offset: 0 }, { extensionsProvider: "mapping-extensions" })).toEqual({ angle: 270, isDot: true });
		});
	});
});
