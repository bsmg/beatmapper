import type { Middleware } from "@reduxjs/toolkit";
import { createStateSyncMiddleware } from "redux-state-sync";

import { AudioSample } from "$/services/audio.service";
import { isHydrationAction } from "$/store/enhancers/storage.enhancer";
import createAudioMiddleware from "./audio.middleware";
import createBackupMiddleware from "./backup.middleware";
import createDemoMiddleware from "./demo.middleware";
import createFileMiddleware from "./file.middleware";
import createHistoryMiddleware from "./history.middleware";
import createPackagingMiddleware from "./packaging.middleware";
import createPlaybackMiddleware from "./playback.middleware";

export function createAppMiddleware() {
	const stateSyncMiddleware = createStateSyncMiddleware({
		predicate: (action) => {
			return isHydrationAction(action);
		},
	});

	const songSample = new AudioSample({ volume: 1, playbackRate: 1 });
	const tickSample = new AudioSample({ volume: 1, playbackRate: 1 });

	const audioMiddleware = createAudioMiddleware({ songSample, tickSample });
	const playbackMiddleware = createPlaybackMiddleware({ songSample });
	const fileMiddleware = createFileMiddleware();
	const downloadMiddleware = createPackagingMiddleware();
	const demoMiddleware = createDemoMiddleware();
	const historyMiddleware = createHistoryMiddleware();
	const backupMiddleware = createBackupMiddleware();

	return [stateSyncMiddleware as Middleware, audioMiddleware, playbackMiddleware, fileMiddleware, downloadMiddleware, demoMiddleware, historyMiddleware, backupMiddleware];
}
