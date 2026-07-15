// biome-ignore-all lint/suspicious/noExplicitAny: type validations for migration steps are not super necessary

import { configureStore, type DevToolsEnhancerOptions } from "@reduxjs/toolkit";
import { omit } from "@std/collections/omit";
import { toPascalCase } from "@std/text/to-pascal-case";
import type { NoteDirection } from "bsmap";
import { initStateWithPrevTab } from "redux-state-sync";
import { default as createLocalStorageDriver } from "unstorage/drivers/localstorage";
import { default as createSessionStorageDriver } from "unstorage/drivers/session-storage";

import { patchEnvironmentName } from "$/helpers/packaging.helpers";
import { createDriver, type LegacyStorageSchema } from "$/services/storage.service";
import { setupAppBeatmapFilestore, setupAppToaster } from "$/setup";
import { type App, type BeatmapId, EventColor, EventEditMode, EventTool, type IGridPresets, type Member, ObjectTool, ObstaclePlacementMode } from "$/types";
import {
	hydrateGridPresets,
	hydrateSongs,
	init,
	tick,
	updateAnnouncements,
	updateBeatDepth,
	updateBloomEnabled,
	updateEventsEditorColor,
	updateEventsEditorCursor,
	updateEventsEditorEditMode,
	updateEventsEditorMirrorLock,
	updateEventsEditorPreview,
	updateEventsEditorTool,
	updateEventsEditorTrackHeight,
	updateEventsEditorTrackOpacity,
	updateEventsEditorWindowLock,
	updateEventsEditorZoomLevel,
	updateNew,
	updateNotesEditorDefaultObstacleDuration,
	updateNotesEditorDirection,
	updateNotesEditorTool,
	updateObstaclePlacementMode,
	updatePacerWait,
	updatePlaybackRate,
	updateRenderScale,
	updateSnap,
	updateSongVolume,
	updateTickType,
	updateTickVolume,
	updateUsername,
} from "./actions";
import { createEntityStorageStrategy, createKeyValueStorageStrategy, createStorageEnhancer } from "./enhancers/storage.enhancer";
import { default as root } from "./features";
import { createAllSharedMiddleware } from "./middleware";
import {
	selectAllGridPresetIds,
	selectAnnouncements,
	selectBeatDepth,
	selectBloomEnabled,
	selectDefaultObstacleDuration,
	selectEventsEditorColor,
	selectEventsEditorEditMode,
	selectEventsEditorMirrorLock,
	selectEventsEditorPreview,
	selectEventsEditorTool,
	selectEventsEditorTrackHeight,
	selectEventsEditorTrackOpacity,
	selectEventsEditorWindowLock,
	selectEventsEditorZoomLevel,
	selectGridPresetById,
	selectNew,
	selectNotesEditorDirection,
	selectNotesEditorTool,
	selectPacerWait,
	selectPlaybackRate,
	selectRenderScale,
	selectSnap,
	selectSongById,
	selectSongIds,
	selectSongVolume,
	selectTickType,
	selectTickVolume,
	selectUsername,
	selectUserObstaclePlacementMode,
} from "./selectors";

const STORAGE_PREFIX = location.hostname === "localhost" ? "beatmapper" : "";

/** @deprecated this is really only used during migration flow, don't use this elsewhere */
function resolveDifficultyFromBeatmapId(bid: BeatmapId) {
	for (const difficulty of ["ExpertPlus", "Expert", "Hard", "Normal", "Easy"].reverse()) {
		if (difficulty === bid.toString()) return difficulty.substring(0, difficulty.length);
	}
	throw new Error(`Could not resolve difficulty from id: ${bid}`);
}
const createAppEntityStorageDriver = createDriver<LegacyStorageSchema & { songs: { key: string; value: App.ISong }; grids: { key: keyof IGridPresets; value: Member<IGridPresets> } }>({
	name: "beat-mapper-state",
	version: 4,
	async upgrade(idb, _current, next, tx) {
		// this is a remnant of localforage, and is no longer necessary since blobs are universally supported
		await idb.removeStore("local-forage-detect-blob-support", tx);

		const prefix = STORAGE_PREFIX.length > 0 ? `${STORAGE_PREFIX}:` : "";

		if (next && next >= 3) {
			await idb.createStore("songs", tx);
			await idb.createStore("grids", tx);
			const value = (await idb.get("keyvaluepairs", import.meta.env.DEV ? "redux-state-dev" : "redux-state", tx)) as string;
			if (value) {
				const snapshot = typeof value === "string" ? JSON.parse(value) : value;
				const username = selectUsername(snapshot);
				localStorage.setItem(`${prefix}user.new`, String(selectNew(snapshot)));
				if (username) localStorage.setItem(`${prefix}user.username`, username);
				localStorage.setItem(`${prefix}user.announcements`, selectAnnouncements(snapshot).toString());
				for (const [id, song] of Object.entries<any>(snapshot.songs.byId)) {
					await idb.set(
						"songs",
						id.toString(),
						{
							...song,
							environment: patchEnvironmentName(song.environment),
							songFilename: song.songFilename.replace("_", "."),
							coverArtFilename: song.coverArtFilename.replace("_", "."),
							colorSchemesById: {},
							difficultiesById: Object.entries<any>(song.difficultiesById).reduce(
								(acc, [id, beatmap]) => {
									const bid = id.toString() ?? beatmap.id.toString();
									acc[bid] = {
										...omit<Record<string, unknown>, string>(beatmap, ["id"]),
										lightshowId: "Common",
										characteristic: "Standard",
										difficulty: resolveDifficultyFromBeatmapId(bid),
										environmentName: patchEnvironmentName(song.environment),
										colorSchemeName: null,
										mappers: song.mapAuthorName ? song.mapAuthorName.split(", ") : [],
										lighters: [],
										customLabel: beatmap.customLabel !== "" ? beatmap.customLabel : undefined,
									};
									return acc;
								},
								{} as Record<string, unknown>,
							),
						},
						tx,
					);
				}
				for (const [id, grid] of Object.entries(snapshot.editor.notes.gridPresets)) {
					await idb.set("grids", id.toString(), grid, tx);
				}
			}
			await idb.removeStore("keyvaluepairs", tx);
		}
		if (next && next >= 4) {
			const keys = await idb.keys("songs", tx);
			await Promise.all([
				keys.forEach(async (sid) => {
					if (sid === toPascalCase(sid)) return;
					const current = (await idb.get("songs", sid, tx)) as App.ISong;
					await idb.set("songs", toPascalCase(sid), { ...current, id: toPascalCase(sid) }, tx);
					await idb.delete("songs", sid);
				}),
			]);
		}
	},
});

export async function createAppStore() {
	setupAppBeatmapFilestore();
	setupAppToaster();

	type LocalStorage = {
		"user.new": boolean;
		"user.announcements": string[];
		"user.username": string;
		"graphics.scale": number;
		"graphics.bloom": boolean;
		"controls.obstacles": number;
		"advanced.wait": number;
	};
	const localStorageEnhancer = createStorageEnhancer(
		createLocalStorageDriver({ base: STORAGE_PREFIX }),
		createKeyValueStorageStrategy<RootState, LocalStorage>({
			"user.new": {
				selectValue: selectNew,
				hydrateValue: (value) => updateNew({ value }),
			},
			"user.announcements": {
				selectValue: selectAnnouncements,
				hydrateValue: (value) => updateAnnouncements({ value }),
			},
			"user.username": {
				selectValue: (state) => selectUsername(state) ?? "",
				hydrateValue: (value) => updateUsername({ value }),
			},
			"graphics.scale": {
				selectValue: selectRenderScale,
				hydrateValue: (value) => updateRenderScale({ value }),
			},
			"graphics.bloom": {
				selectValue: selectBloomEnabled,
				hydrateValue: (checked) => updateBloomEnabled({ checked }),
			},
			"controls.obstacles": {
				selectValue: (state) => Object.values(ObstaclePlacementMode).indexOf(selectUserObstaclePlacementMode(state)),
				hydrateValue: (index) => updateObstaclePlacementMode({ value: Object.values(ObstaclePlacementMode)[index] }),
			},
			"advanced.wait": {
				selectValue: selectPacerWait,
				hydrateValue: (value) => updatePacerWait({ value }),
			},
		}),
	);

	type SessionStorage = {
		"track.snap": number;
		"track.spacing": number;
		"playback.rate": number;
		"playback.volume": number;
		"tick.volume": number;
		"tick.type": number;
		"notes.tool": number;
		"notes.direction": NoteDirection;
		"notes.duration": number;
		"events.mode": number;
		"events.tool": number;
		"events.color": number;
		"events.zoom": number;
		"events.opacity": number;
		"events.height": number;
		"events.preview": boolean;
		"events.loop": boolean;
		"events.mirror": boolean;
	};
	const sessionStorageEnhancer = createStorageEnhancer(
		createSessionStorageDriver({ base: STORAGE_PREFIX }),
		createKeyValueStorageStrategy<RootState, SessionStorage>({
			"track.snap": {
				selectValue: selectSnap,
				hydrateValue: (value) => updateSnap({ value }),
			},
			"track.spacing": {
				selectValue: selectBeatDepth,
				hydrateValue: (value) => updateBeatDepth({ value }),
			},
			"playback.rate": {
				selectValue: selectPlaybackRate,
				hydrateValue: (value) => updatePlaybackRate({ value }),
			},
			"playback.volume": {
				selectValue: selectSongVolume,
				hydrateValue: (value) => updateSongVolume({ value }),
			},
			"tick.volume": {
				selectValue: selectTickVolume,
				hydrateValue: (value) => updateTickVolume({ value }),
			},
			"tick.type": {
				selectValue: selectTickType,
				hydrateValue: (value) => updateTickType({ value }),
			},
			"notes.tool": {
				selectValue: (state) => Object.values(ObjectTool).indexOf(selectNotesEditorTool(state)),
				hydrateValue: (index) => updateNotesEditorTool({ tool: Object.values(ObjectTool)[index] }),
			},
			"notes.direction": {
				selectValue: selectNotesEditorDirection,
				hydrateValue: (direction) => updateNotesEditorDirection({ direction }),
			},
			"notes.duration": {
				selectValue: selectDefaultObstacleDuration,
				hydrateValue: (value) => updateNotesEditorDefaultObstacleDuration({ value }),
			},
			"events.mode": {
				selectValue: (state) => Object.values(EventEditMode).indexOf(selectEventsEditorEditMode(state)),
				hydrateValue: (index) => updateEventsEditorEditMode({ editMode: Object.values(EventEditMode)[index] }),
			},
			"events.tool": {
				selectValue: (state) => Object.values(EventTool).indexOf(selectEventsEditorTool(state)),
				hydrateValue: (index) => updateEventsEditorTool({ tool: Object.values(EventTool)[index] }),
			},
			"events.color": {
				selectValue: (state) => Object.values(EventColor).indexOf(selectEventsEditorColor(state)),
				hydrateValue: (index) => updateEventsEditorColor({ color: Object.values(EventColor)[index] }),
			},
			"events.zoom": {
				selectValue: selectEventsEditorZoomLevel,
				hydrateValue: (value) => updateEventsEditorZoomLevel({ value }),
			},
			"events.opacity": {
				selectValue: selectEventsEditorTrackOpacity,
				hydrateValue: (newOpacity) => updateEventsEditorTrackOpacity({ newOpacity }),
			},
			"events.height": {
				selectValue: selectEventsEditorTrackHeight,
				hydrateValue: (newHeight) => updateEventsEditorTrackHeight({ newHeight }),
			},
			"events.preview": {
				selectValue: selectEventsEditorPreview,
				hydrateValue: (checked) => updateEventsEditorPreview({ checked }),
			},
			"events.loop": {
				selectValue: selectEventsEditorWindowLock,
				hydrateValue: (checked) => updateEventsEditorWindowLock({ checked }),
			},
			"events.mirror": {
				selectValue: selectEventsEditorMirrorLock,
				hydrateValue: (checked) => updateEventsEditorMirrorLock({ checked }),
			},
		}),
	);

	const songStorageEnhancer = createStorageEnhancer(
		createAppEntityStorageDriver({ name: "songs" }),
		createEntityStorageStrategy<RootState, App.ISong>({
			selectIds: (state) => selectSongIds(state).map((x) => x.toString()),
			selectById: selectSongById,
			hydrateEntities: hydrateSongs,
		}),
	);
	const gridStorageEnhancer = createStorageEnhancer(
		createAppEntityStorageDriver({ name: "grids" }),
		createEntityStorageStrategy<RootState, Member<IGridPresets>>({
			selectIds: selectAllGridPresetIds,
			selectById: selectGridPresetById,
			hydrateEntities: hydrateGridPresets,
		}),
	);

	const devTools: DevToolsEnhancerOptions = {
		name: "Beatmapper",
		actionsDenylist: [tick.type, updateEventsEditorCursor.type],
	};

	const store = configureStore({
		reducer: root.reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware().concat(createAllSharedMiddleware());
		},
		enhancers: (getDefaultEnhancers) => {
			return getDefaultEnhancers().concat(localStorageEnhancer, sessionStorageEnhancer, songStorageEnhancer, gridStorageEnhancer);
		},
	});

	await store.hydrate().then(() => {
		store.dispatch(init());
	});

	initStateWithPrevTab(store);

	return store;
}

export type RootState = ReturnType<typeof root.reducer>;
export type AppDispatch = Awaited<ReturnType<typeof createAppStore>>["dispatch"];
