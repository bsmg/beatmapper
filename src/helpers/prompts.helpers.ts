/**
 * Utilities around prompting the user for information.
 * Currently uses window.prompt, but I should build something prettier.
 */

import type { AsyncThunkAction, PayloadAction } from "@reduxjs/toolkit";
import { type BaseIssue, type BaseSchema, nonEmpty, pipe, safeParse, string, transform, trim, values } from "valibot";

import { APP_TOASTER } from "$/components/app/constants";
import { GRID_PRESET_SLOTS } from "$/constants";
import { addBookmark, jumpToBeat, saveGridPreset, selectAllEntitiesInRange, updateAllSelectedObstacles } from "$/store/actions";
import type { App, IGridPresets } from "$/types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyActionCreator = (...args: any[]) => PayloadAction<unknown> | AsyncThunkAction<unknown, unknown, {}>;

interface DispatchWithPromptOptions<A extends AnyActionCreator, T> {
	prompt: string;
	validate: BaseSchema<string | null, T, BaseIssue<unknown>>;
	fallback?: string;
	callback: (result: T) => Parameters<A>[0];
}
function withPrompt<A extends AnyActionCreator, T>(action: A, { prompt, validate, fallback, callback }: DispatchWithPromptOptions<A, T>) {
	const result = window.prompt(prompt, fallback);
	const r = safeParse(validate, result);
	if (r.issues && r.issues.length > 0) {
		for (const issue of r.issues) {
			APP_TOASTER.error({ id: "prompt-error", description: issue.message });
			throw new Error(issue.message);
		}
	}
	return action(callback(r.output as T));
}

export function promptQuickSelect(args: Omit<Parameters<typeof selectAllEntitiesInRange>[0], "start" | "end">) {
	return withPrompt(selectAllEntitiesInRange, {
		prompt: 'Quick-select all entities in a given range of beats. Eg. "16-32" will select everything from beat 16 to 32.',
		validate: pipe(
			string(),
			trim(),
			transform((input) => input.split("-")),
		),
		callback: (range) => {
			let [start, end] = range.map(Number);
			if (typeof end !== "number") {
				end = Number.POSITIVE_INFINITY;
			}
			return { ...args, start, end };
		},
	});
}

export function promptJumpToBeat(args: Omit<Parameters<typeof jumpToBeat>[0], "beatNum">) {
	return withPrompt(jumpToBeat, {
		prompt: "Enter the beat number you wish to jump to (eg. 16)",
		validate: pipe(
			string(),
			nonEmpty(),
			transform((input) => Number.parseFloat(input)),
		),
		callback: (beatNum) => {
			return { ...args, beatNum: beatNum };
		},
	});
}

export function promptChangeObstacleDuration(obstacles: App.IObstacle[]) {
	const selectedObstacleDurations: Record<string, boolean> = {};
	const numOfDifferentDurations = Object.keys(selectedObstacleDurations).length;

	return withPrompt(updateAllSelectedObstacles, {
		prompt: obstacles.length === 1 ? "Enter the new duration for this wall, in beats" : "Enter the new duration for all selected walls",
		fallback: obstacles[0].duration.toString(),
		validate: pipe(
			string(),
			nonEmpty(),
			transform((input) => Number.parseFloat(input)),
		),
		callback: (newDuration) => {
			for (const obstacle of obstacles) {
				selectedObstacleDurations[obstacle.duration] = true;
			}
			if (numOfDifferentDurations > 1) {
				const message = `Warning: You've selected obstacles with different durations. This will set all selected obstacles to ${newDuration} ${(newDuration) === 1 ? "beat" : "beats"}. Is this what you want?`;
				if (!window.confirm(message)) throw void {};
			}
			return { changes: { duration: newDuration } };
		},
	});
}

export function promptSaveGridPreset(gridPresets: IGridPresets, args: Omit<Parameters<typeof saveGridPreset>[0], "presetSlot">) {
	return withPrompt(saveGridPreset, {
		prompt: "Select a number from 1 to 4 to store this preset",
		fallback: GRID_PRESET_SLOTS.find((n) => !gridPresets[n]),
		validate: pipe(string(), values(GRID_PRESET_SLOTS)),
		callback: (providedValue) => {
			return { ...args, presetSlot: providedValue };
		},
	});
}

export function promptAddBookmark(args: Omit<Parameters<typeof addBookmark>[0], "time" | "name" | "color">) {
	return withPrompt(addBookmark, {
		prompt: "Enter a name for this bookmark.",
		validate: pipe(string(), nonEmpty()),
		callback: (name) => {
			return { ...args, name: name };
		},
	});
}
