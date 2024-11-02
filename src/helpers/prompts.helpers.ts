/**
 * Utilities around prompting the user for information.
 * Currently uses window.prompt, but I should build something prettier.
 */

import { GRID_PRESET_SLOTS } from "$/constants";
import type { jumpToBeat, resizeSelectedObstacles, saveGridPreset, selectAllInRange } from "$/store/actions";
import type { App, GridPresets, View } from "$/types";

export function promptQuickSelect(view: View, wrappedAction: typeof selectAllInRange) {
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

	return wrappedAction({ view, start, end });
}

export function promptJumpToBeat(wrappedAction: typeof jumpToBeat, additionalArgs: Omit<Parameters<typeof jumpToBeat>[0], "beatNum">) {
	const beatNum = window.prompt("Enter the beat number you wish to jump to (eg. 16)");

	if (beatNum === null || beatNum === "") {
		throw new Error("Invalid beat number.");
	}

	return wrappedAction({ beatNum: Number(beatNum), ...additionalArgs });
}

export function promptChangeObstacleDuration(obstacles: App.Obstacle[], wrappedAction: typeof resizeSelectedObstacles) {
	const { beatDuration } = obstacles[0];

	const promptCopy = obstacles.length === 1 ? "Enter the new duration for this wall, in beats" : "Enter the new duration for all selected walls";

	const newDuration = window.prompt(promptCopy, `${beatDuration}`);

	if (newDuration === null || newDuration === "") {
		throw new Error("Invalid duration.");
	}

	const selectedObstacleDurations: Record<string, boolean> = {};
	for (const obstacle of obstacles) {
		selectedObstacleDurations[obstacle.beatDuration] = true;
	}
	const numOfDifferentDurations = Object.keys(selectedObstacleDurations).length;

	if (numOfDifferentDurations > 1) {
		const hasConfirmed = window.confirm(`Warning: You've selected obstacles with different durations. This will set all selected obstacles to ${newDuration} ${Number(newDuration) === 1 ? "beat" : "beats"}. Is this what you want?`);

		if (!hasConfirmed) {
			throw void {};
		}
	}

	return wrappedAction({ newBeatDuration: Number(newDuration) });
}

export function promptSaveGridPreset(gridPresets: GridPresets, wrappedAction: typeof saveGridPreset) {
	const presetSlots = [...GRID_PRESET_SLOTS];
	const suggestedPreset = GRID_PRESET_SLOTS.find((n) => !gridPresets[n]);

	const providedValue = window.prompt("Select a number from 1 to 4 to store this preset", suggestedPreset);

	if (!providedValue) {
		throw new Error("Invalid preset slot.");
	}

	const isValidInput = presetSlots.some((n) => n === providedValue);

	if (!isValidInput) {
		window.alert("The value you provided was not accepted. Please enter 1, 2, 3, or 4.");
	}

	return wrappedAction({ presetSlot: providedValue });
}
