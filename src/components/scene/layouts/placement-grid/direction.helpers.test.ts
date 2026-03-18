import { NoteDirection } from "bsmap";
import { describe, expect, it } from "vitest";

import { NotePlacementMode } from "$/types";
import { resolveNoteDirectionForPlacementMode } from "./direction.helpers";

describe(resolveNoteDirectionForPlacementMode.name, () => {
	const initialPos = { x: 0, y: 0 };

	describe(NotePlacementMode.NORMAL, () => {
		it("calculates nearest cardinal direction for x-axis", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 100, y: 15 }, { usePrecisionPlacement: false });
			expect(result).toBe(NoteDirection.RIGHT); // x-axis moves from left-to-right
		});
		it("calculates nearest cardinal direction for y-axis", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 15, y: 100 }, { usePrecisionPlacement: false });
			expect(result).toBe(NoteDirection.DOWN); // y-axis moves from top-to-bottom
		});
		it('returns "any" direction when currently selected', () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 50, y: 25 }, { usePrecisionPlacement: false, selectedDirection: NoteDirection.ANY });
			expect(result).toBe(NoteDirection.ANY);
		});
	});
	describe(NotePlacementMode.EXTENSIONS, () => {
		it("calculates the extended angle for standard notes", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 0, y: -100 }, { usePrecisionPlacement: true });
			expect(result).toBeGreaterThanOrEqual(1000);
			expect(result).toBeLessThan(2000);
		});
		it("calculates the extended angle for dot notes", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 0, y: -100 }, { usePrecisionPlacement: true, selectedDirection: NoteDirection.ANY });
			expect(result).toBeGreaterThanOrEqual(2000);
			expect(result).toBeLessThan(3000);
		});
	});

	describe("when threshold is defined", () => {
		const threshold = 25;
		it("returns the direction if distance exceeds the threshold", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 50, y: 0 }, { usePrecisionPlacement: false, threshold });
			expect(result).not.toBeNull();
		});
		it("returns null if distance is below the threshold", () => {
			const result = resolveNoteDirectionForPlacementMode(initialPos, { x: 10, y: 10 }, { usePrecisionPlacement: false, threshold });
			expect(result).toBeNull();
		});
	});
});
