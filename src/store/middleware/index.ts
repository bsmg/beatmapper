import { createStateSyncMiddleware } from "redux-state-sync";

import type { BeatmapFilestore } from "$/services/file.service";
import type { createAutosaveWorker } from "$/workers";
import createAudioMiddleware from "./audio.middleware";
import createBackupMiddleware from "./backup.middleware";
import createDemoMiddleware from "./demo.middleware";
import createFileMiddleware from "./file.middleware";
import createHistoryMiddleware from "./history.middleware";
import createPackagingMiddleware from "./packaging.middleware";

export { createStorageMiddleware, type StorageObserver } from "./storage.middleware";

interface Options {
	filestore: BeatmapFilestore;
	autosaveWorker: ReturnType<typeof createAutosaveWorker>;
}
export function createAllSharedMiddleware({ filestore, autosaveWorker }: Options) {
	const stateSyncMiddleware = createStateSyncMiddleware({
		predicate: (action) => {
			if (action.type.startsWith("@@STORAGE")) return true;
			return false;
		},
	});

	const audioMiddleware = createAudioMiddleware({ filestore });
	const fileMiddleware = createFileMiddleware({ filestore });
	const downloadMiddleware = createPackagingMiddleware({ filestore });
	const backupMiddleware = createBackupMiddleware({ filestore, worker: autosaveWorker });
	const demoMiddleware = createDemoMiddleware();
	const historyMiddleware = createHistoryMiddleware();

	return [
		// For unknown reasons, things crash when `stateSyncMiddleware` is further down.
		stateSyncMiddleware,
		audioMiddleware,
		fileMiddleware,
		downloadMiddleware,
		demoMiddleware,
		historyMiddleware,
		// We have two middlewares related to persistence:
		// - Backup middleware saves the editor entities as beatmap files, also in indexeddb.
		// - Storage middleware persists the current redux state to indexeddb (injected during setup)
		// It's important that this stuff happens last, after all the other middlewares have fully affected the state.
		backupMiddleware,
	];
}
