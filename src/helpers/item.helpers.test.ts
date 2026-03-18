import { randomIntegerBetween } from "@std/random";
import { describe, expect, it } from "vitest";

import { mirrorCoordinate } from "./item.helpers";

describe(mirrorCoordinate.name, () => {
	it("mirrors a vanilla coordinate", () => {
		expect(mirrorCoordinate(0, 5)).toBe(4);
		expect(mirrorCoordinate(1, 5)).toBe(3);
		expect(mirrorCoordinate(4, 5)).toBe(0);
		expect(mirrorCoordinate(0, 4)).toBe(3);
		expect(mirrorCoordinate(1, 4)).toBe(2);
	});
	it("mirrors an extended coordinate", () => {
		expect(mirrorCoordinate(1000, 5)).toBe(5000);
		expect(mirrorCoordinate(2000, 5)).toBe(4000);
		expect(mirrorCoordinate(-1000, 5)).toBe(5000);
	});
	it("mirrors correctly when using an offset axis (vanilla)", () => {
		expect(mirrorCoordinate(1, 5, 1)).toBe(3);
	});
	it("mirrors correctly when using an offset axis (extensions)", () => {
		expect(mirrorCoordinate(0, 5, 1000)).toBe(5);
	});
	it("maintains consistency when mirroring twice", () => {
		const coordinate = randomIntegerBetween(1, 10);
		const count = randomIntegerBetween(1, 10);
		expect(mirrorCoordinate(mirrorCoordinate(coordinate, count), count)).toBe(coordinate);
	});
});
