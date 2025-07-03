import { nonEmpty, pipe, string, transform, trim, values } from "valibot";

import { APP_TOASTER } from "$/components/app/constants";
import { usePrompt } from "$/components/ui/hooks";
import { GRID_PRESET_SLOTS } from "$/constants";
import { addBookmark, jumpToBeat, saveGridPreset, selectAllEntitiesInRange, updateAllSelectedObstacles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObstacles, selectGridPresets } from "$/store/selectors";
import { View } from "$/types";

export function useQuickSelectPrompt({ songId: sid }: Omit<Parameters<typeof selectAllEntitiesInRange>[0], "view" | "start" | "end">) {
	const dispatch = useAppDispatch();

	return usePrompt({
		toaster: APP_TOASTER,
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
			return dispatch(selectAllEntitiesInRange({ songId: sid, view: View.BEATMAP, start, end }));
		},
	});
}

export function useJumpToBeatPrompt({ songId }: Omit<Parameters<typeof jumpToBeat>[0], "pauseTrack" | "beatNum">) {
	const dispatch = useAppDispatch();

	return usePrompt({
		toaster: APP_TOASTER,
		validate: pipe(
			string(),
			nonEmpty(),
			transform((input) => Number.parseFloat(input)),
		),
		callback: (beatNum) => {
			return dispatch(jumpToBeat({ songId, pauseTrack: true, beatNum: beatNum }));
		},
	});
}

export function useAddBookmarkPrompt({ songId, view }: Omit<Parameters<typeof addBookmark>[0], "name"> & { view: View }) {
	const dispatch = useAppDispatch();

	return usePrompt({
		toaster: APP_TOASTER,
		validate: pipe(string(), nonEmpty()),
		callback: (name) => {
			return dispatch(addBookmark({ songId, view, name }));
		},
	});
}

export function useUpdateAllSelectedObstaclesPrompt() {
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);
	const dispatch = useAppDispatch();

	return usePrompt({
		toaster: APP_TOASTER,
		fallback: selectedObstacles[0].duration.toString(),
		validate: pipe(
			string(),
			nonEmpty(),
			transform((input) => Number.parseFloat(input)),
		),
		callback: (newDuration) => {
			return dispatch(updateAllSelectedObstacles({ changes: { duration: newDuration } }));
		},
	});
}

export function useSaveGridPresetPrompt({ songId }: Omit<Parameters<typeof saveGridPreset>[0], "presetSlot">) {
	const gridPresets = useAppSelector((state) => selectGridPresets(state));
	const dispatch = useAppDispatch();

	return usePrompt({
		toaster: APP_TOASTER,
		fallback: GRID_PRESET_SLOTS.find((n) => !gridPresets[n]),
		validate: pipe(string(), values(GRID_PRESET_SLOTS)),
		callback: (providedValue) => {
			return dispatch(saveGridPreset({ songId, presetSlot: providedValue }));
		},
	});
}
