import { describe, expect, it } from "vitest";

import { DEFAULT_GRID } from "$/constants";
import { deriveColorSchemeFromEnvironment } from "./colors.helpers";
import { createAppBeatmap, getColorScheme, getEnvironment, getGridSize } from "./song.helpers";

describe(getEnvironment.name, () => {
	const mock = {
		environment: "NiceEnvironment" as const,
		difficultiesById: {
			Easy: createAppBeatmap({ characteristic: "Standard", difficulty: "Easy", environmentName: "LatticeEnvironment" }),
		},
	};
	it("outputs base environment when no overrides exist", () => {
		expect(getEnvironment(mock)).toBe("NiceEnvironment");
	});
	it("outputs beatmap environment override when defined", () => {
		expect(getEnvironment(mock, "Easy")).toBe("LatticeEnvironment");
	});
});

describe(getColorScheme.name, () => {
	const mock = {
		environment: "NiceEnvironment" as const,
		difficultiesById: {
			Easy: createAppBeatmap({ characteristic: "Standard", difficulty: "Easy", environmentName: "LatticeEnvironment", colorSchemeName: "Collider" }),
			Hard: createAppBeatmap({ characteristic: "Standard", difficulty: "Hard", environmentName: "LatticeEnvironment" }),
		},
		colorSchemesById: {
			Collider: deriveColorSchemeFromEnvironment("ColliderEnvironment"),
		},
		modSettings: {
			customColors: { isEnabled: false, colorLeft: "#ffffff" },
		},
	};
	it("outputs base environment when no overrides exist", () => {
		const scheme = getColorScheme(mock);
		const expectedColorScheme = deriveColorSchemeFromEnvironment("NiceEnvironment");
		expect(scheme.colorLeft).toBe(expectedColorScheme.colorLeft);
	});
	it("outputs beatmap color scheme override when defined", () => {
		const scheme = getColorScheme(mock, "Easy");
		const expectedColorScheme = deriveColorSchemeFromEnvironment("ColliderEnvironment");
		expect(scheme.colorLeft).toBe(expectedColorScheme.colorLeft);
	});
	it("outputs environment color scheme if color scheme override is not defined", () => {
		const scheme = getColorScheme(mock, "Hard");
		const expectedColorScheme = deriveColorSchemeFromEnvironment("LatticeEnvironment");
		expect(scheme.colorLeft).toBe(expectedColorScheme.colorLeft);
	});
	it("outputs custom color scheme when enabled", () => {
		mock.modSettings.customColors.isEnabled = true;
		const scheme = getColorScheme(mock, "Easy");
		expect(scheme.colorLeft).toBe("#ffffff");
	});
});

describe(getGridSize.name, () => {
	const mock = {
		modSettings: { mappingExtensions: { isEnabled: false, numRows: 10, numCols: 10 } },
	};
	it("outputs default grid when mapping extensions are disabled", () => {
		const result = getGridSize(mock);
		expect(result).toEqual(DEFAULT_GRID);
	});
	it("outputs extended grid when mapping extensions are enabled", () => {
		mock.modSettings.mappingExtensions.isEnabled = true;
		const result = getGridSize(mock);
		expect(result.numRows).toBe(10);
		expect(result.numCols).toBe(10);
	});
});
