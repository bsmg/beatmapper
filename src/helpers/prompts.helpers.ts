/**
 * Utilities around prompting the user for information.
 * Currently uses window.prompt, but I should build something prettier.
 */

import { APP_TOASTER } from "$/components/app/constants";
import { GRID_PRESET_SLOTS } from "$/constants";
import type { jumpToBeat, resizeSelectedObstacles, saveGridPreset, selectAllInRange } from "$/store/actions";
import type { App, GridPresets } from "$/types";

export function promptQuickSelect(wrappedAction: typeof selectAllInRange, args: Omit<Parameters<typeof selectAllInRange>[0], "start" | "end">) {
	let beatStr = window.prompt('Quick-select all entities in a given range of beats. Eg. "16-32" will select everything from beat 16 to 32.');

	if (!beatStr) {
		throw new Error("Invalid beat number.");
	}

	beatStr = beatStr.replace(/\s/g, ""); // Remove whitespace

	const startAndEnd = beatStr.split("-");
	let [start, end] = startAndEnd.map(Number);

	if (typeof end !== "number") {
		end = Number.POSITIVE_INFINITY;
	}

	return wrappedAction({ ...args, start, end });
}

export function promptJumpToBeat(wrappedAction: typeof jumpToBeat, args: Omit<Parameters<typeof jumpToBeat>[0], "beatNum">) {
	const beatNum = window.prompt("Enter the beat number you wish to jump to (eg. 16)");

	if (beatNum === null || beatNum === "") {
		throw new Error("Invalid beat number.");
	}

	return wrappedAction({ ...args, beatNum: Number(beatNum) });
}

export function promptChangeObstacleDuration(wrappedAction: typeof resizeSelectedObstacles, obstacles: App.IObstacle[], args: Omit<Parameters<typeof resizeSelectedObstacles>[0], "newBeatDuration">) {
	const { duration: beatDuration } = obstacles[0];

	const promptCopy = obstacles.length === 1 ? "Enter the new duration for this wall, in beats" : "Enter the new duration for all selected walls";

	const newDuration = window.prompt(promptCopy, `${beatDuration}`);

	if (newDuration === null || newDuration === "") {
		throw new Error("Invalid duration.");
	}

	const selectedObstacleDurations: Record<string, boolean> = {};
	for (const obstacle of obstacles) {
		selectedObstacleDurations[obstacle.duration] = true;
	}
	const numOfDifferentDurations = Object.keys(selectedObstacleDurations).length;

	if (numOfDifferentDurations > 1) {
		const hasConfirmed = window.confirm(`Warning: You've selected obstacles with different durations. This will set all selected obstacles to ${newDuration} ${Number(newDuration) === 1 ? "beat" : "beats"}. Is this what you want?`);

		if (!hasConfirmed) {
			throw void {};
		}
	}

	return wrappedAction({ ...args, newBeatDuration: Number(newDuration) });
}

export function promptSaveGridPreset(wrappedAction: typeof saveGridPreset, gridPresets: GridPresets, args: Omit<Parameters<typeof saveGridPreset>[0], "presetSlot">) {
	const presetSlots = [...GRID_PRESET_SLOTS];
	const suggestedPreset = GRID_PRESET_SLOTS.find((n) => !gridPresets[n]);

	const providedValue = window.prompt("Select a number from 1 to 4 to store this preset", suggestedPreset);

	if (!providedValue) {
		throw new Error("Invalid preset slot.");
	}

	const isValidInput = presetSlots.some((n) => n === providedValue);

	if (!isValidInput) {
		throw APP_TOASTER.create({
			id: "invalid-grid-preset",
			type: "error",
			description: "The value you provided was not accepted. Please enter 1, 2, 3, or 4.",
		});
	}

	return wrappedAction({ ...args, presetSlot: providedValue });
}
