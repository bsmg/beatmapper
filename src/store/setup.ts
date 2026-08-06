// biome-ignore-all lint/suspicious/noExplicitAny: type validations for migration steps are not super necessary

import { configureStore, type DevToolsEnhancerOptions, type ThunkDispatch, type UnknownAction } from "@reduxjs/toolkit";
import { omit } from "@std/collections/omit";
import { toPascalCase } from "@std/text/to-pascal-case";
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
	updateTrackScale,
	updateUsername,
} from "./actions";
import { createEntityStorageStrategy, createEnumerableStorageObserver, createKeyValueStorageStrategy, createStorageEnhancer } from "./enhancers/storage.enhancer";
import { default as reducer } from "./features";
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

// biome-ignore-start assist/source/organizeImports: circular dependencies

import { getRouter } from "$/router";

// biome-ignore-end assist/source/organizeImports: circular dependencies

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

export interface AppExtraArgs {
	getRouter: typeof getRouter;
}

export async function createAppStore() {
	setupAppBeatmapFilestore();
	setupAppToaster();

	const localStorageEnhancer = createStorageEnhancer(
		createLocalStorageDriver({ base: STORAGE_PREFIX }),
		createKeyValueStorageStrategy({
			"user.new": {
				selectValue: selectNew,
				hydrateValue: updateNew,
			},
			"user.announcements": {
				selectValue: selectAnnouncements,
				hydrateValue: updateAnnouncements,
			},
			"user.username": {
				selectValue: selectUsername,
				hydrateValue: updateUsername,
			},
			"graphics.scale": {
				selectValue: selectRenderScale,
				hydrateValue: updateRenderScale,
			},
			"graphics.bloom": {
				selectValue: selectBloomEnabled,
				hydrateValue: updateBloomEnabled,
			},
			"controls.obstacles": createEnumerableStorageObserver(ObstaclePlacementMode, {
				selectValue: selectUserObstaclePlacementMode,
				hydrateValue: updateObstaclePlacementMode,
			}),
			"advanced.wait": {
				selectValue: selectPacerWait,
				hydrateValue: updatePacerWait,
			},
		}),
	);

	const sessionStorageEnhancer = createStorageEnhancer(
		createSessionStorageDriver({ base: STORAGE_PREFIX }),
		createKeyValueStorageStrategy({
			"track.snap": {
				selectValue: selectSnap,
				hydrateValue: updateSnap,
			},
			"track.spacing": {
				selectValue: selectBeatDepth,
				hydrateValue: updateTrackScale,
			},
			"playback.rate": {
				selectValue: selectPlaybackRate,
				hydrateValue: updatePlaybackRate,
			},
			"playback.volume": {
				selectValue: selectSongVolume,
				hydrateValue: updateSongVolume,
			},
			"tick.volume": {
				selectValue: selectTickVolume,
				hydrateValue: updateTickVolume,
			},
			"tick.type": {
				selectValue: selectTickType,
				hydrateValue: updateTickType,
			},
			"notes.tool": createEnumerableStorageObserver(ObjectTool, {
				selectValue: selectNotesEditorTool,
				hydrateValue: updateNotesEditorTool,
			}),
			"notes.direction": {
				selectValue: selectNotesEditorDirection,
				hydrateValue: updateNotesEditorDirection,
			},
			"notes.duration": {
				selectValue: selectDefaultObstacleDuration,
				hydrateValue: updateNotesEditorDefaultObstacleDuration,
			},
			"events.mode": createEnumerableStorageObserver(EventEditMode, {
				selectValue: selectEventsEditorEditMode,
				hydrateValue: updateEventsEditorEditMode,
			}),
			"events.tool": createEnumerableStorageObserver(EventTool, {
				selectValue: selectEventsEditorTool,
				hydrateValue: updateEventsEditorTool,
			}),
			"events.color": createEnumerableStorageObserver(EventColor, {
				selectValue: selectEventsEditorColor,
				hydrateValue: updateEventsEditorColor,
			}),
			"events.zoom": {
				selectValue: selectEventsEditorZoomLevel,
				hydrateValue: updateEventsEditorZoomLevel,
			},
			"events.opacity": {
				selectValue: selectEventsEditorTrackOpacity,
				hydrateValue: updateEventsEditorTrackOpacity,
			},
			"events.height": {
				selectValue: selectEventsEditorTrackHeight,
				hydrateValue: updateEventsEditorTrackHeight,
			},
			"events.preview": {
				selectValue: selectEventsEditorPreview,
				hydrateValue: updateEventsEditorPreview,
			},
			"events.loop": {
				selectValue: selectEventsEditorWindowLock,
				hydrateValue: updateEventsEditorWindowLock,
			},
			"events.mirror": {
				selectValue: selectEventsEditorMirrorLock,
				hydrateValue: updateEventsEditorMirrorLock,
			},
		}),
	);

	const songStorageEnhancer = createStorageEnhancer(
		createAppEntityStorageDriver({ name: "songs" }),
		createEntityStorageStrategy({
			selectIds: (state) => selectSongIds(state).map((x) => x.toString()),
			selectById: selectSongById,
			hydrateEntities: hydrateSongs,
		}),
	);
	const gridStorageEnhancer = createStorageEnhancer(
		createAppEntityStorageDriver({ name: "grids" }),
		createEntityStorageStrategy({
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
		reducer: reducer,
		devTools: import.meta.env.VITE_ENABLE_DEVTOOLS ? devTools : undefined,
		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware({ thunk: { extraArgument: { getRouter } } }).concat(createAllSharedMiddleware());
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

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = ThunkDispatch<RootState, AppExtraArgs, UnknownAction>;

export interface AppThunkApiConfig {
	state: RootState;
	dispatch: AppDispatch;
	extra: AppExtraArgs;
}
