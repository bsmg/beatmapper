import { createListCollection } from "@ark-ui/react";
import type { PropsWithChildren } from "react";
import { gtValue, nonEmpty, number, object, picklist, pipe, regex, string } from "valibot";

import { createPrompterFactory } from "$/components/ui/compositions";
import { GRID_PRESET_SLOTS } from "$/constants";
import { store } from "$/setup";
import { addBookmark, jumpToBeat, saveGridPreset, selectAllEntitiesInRange, updateAllSelectedObstacles } from "$/store/actions";
import { useAppSelector } from "$/store/hooks";
import { selectAllSelectedObstacles } from "$/store/selectors";
import type { App, SongId, View } from "$/types";

interface Props {
	sid: SongId;
	view: View;
	selectedObstacles: App.IObstacle[];
}

const createPrompter = createPrompterFactory<Props>();

const { Provider, useContext } = createPrompter(({ createPrompt }) => {
	const GRID_PRESET_SLOT_COLLECTION = createListCollection({ items: GRID_PRESET_SLOTS });

	return {
		QUICK_SELECT: createPrompt({
			title: "Quick Select",
			defaultValues: () => ({ range: "" }),
			validate: object({
				range: pipe(
					string(),
					regex(/^\d+(-\d+)?$/, (issue) => `Invalid format: Expected <number> or <number>-<number> but received "${issue.input}"`),
				),
			}),
			render: ({ form }) => <form.AppField name="range">{(ctx) => <ctx.Input autoFocus label="Range" placeholder="8-12" />}</form.AppField>,
			onSubmit: ({ value, props: { sid, view } }) => {
				let [start, end] = value.range
					.trim()
					.split("-")
					.map((x) => Number.parseFloat(x));
				if (typeof end !== "number") {
					end = Number.POSITIVE_INFINITY;
				}
				return store.dispatch(selectAllEntitiesInRange({ songId: sid, view: view, start, end }));
			},
		}),
		JUMP_TO_BEAT: createPrompt({
			title: "Jump to Beat",
			defaultValues: () => ({ beatNum: 0 }),
			validate: object({ beatNum: number() }),
			render: ({ form }) => <form.AppField name="beatNum">{(ctx) => <ctx.NumberInput autoFocus label="Beat" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value, props: { sid } }) => {
				return store.dispatch(jumpToBeat({ songId: sid, pauseTrack: true, beatNum: value.beatNum }));
			},
		}),
		ADD_BOOKMARK: createPrompt({
			title: "Add Bookmark",
			defaultValues: () => ({ name: "" }),
			validate: object({ name: pipe(string(), nonEmpty()) }),
			render: ({ form }) => <form.AppField name="name">{(ctx) => <ctx.Input autoFocus label="Name" />}</form.AppField>,
			onSubmit: ({ value, props: { sid, view } }) => {
				return store.dispatch(addBookmark({ songId: sid, view, name: value.name }));
			},
		}),
		UPDATE_OBSTACLE_DURATION: createPrompt({
			title: "Update Duration for Obstacles",
			defaultValues: ({ props: { selectedObstacles } }) => ({ duration: selectedObstacles[0].duration }),
			validate: object({ duration: pipe(number(), gtValue(0)) }),
			render: ({ form }) => <form.AppField name="duration">{(ctx) => <ctx.NumberInput autoFocus label="Duration" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value }) => {
				return store.dispatch(updateAllSelectedObstacles({ changes: { duration: value.duration } }));
			},
		}),
		SAVE_GRID_PRESET: createPrompt({
			title: "Save Grid Preset",
			defaultValues: () => ({ slot: GRID_PRESET_SLOTS[0] }),
			validate: object({ slot: picklist(GRID_PRESET_SLOTS) }),
			render: ({ form }) => <form.AppField name="slot">{(ctx) => <ctx.Select autoFocus label="Preset Slot" collection={GRID_PRESET_SLOT_COLLECTION} />}</form.AppField>,
			onSubmit: ({ value, props: { sid } }) => {
				return store.dispatch(saveGridPreset({ songId: sid, presetSlot: value.slot }));
			},
		}),
	};
});

export function AppPrompter({ sid, view, children }: Pick<Props, "sid" | "view"> & PropsWithChildren) {
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);

	return (
		<Provider sid={sid} view={view} selectedObstacles={selectedObstacles}>
			{children}
		</Provider>
	);
}

export { useContext as useAppPrompterContext };
