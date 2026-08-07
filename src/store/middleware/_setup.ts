import type { Middleware } from "@reduxjs/toolkit";
import { createStateSyncMiddleware } from "redux-state-sync";

import { AudioSample } from "$/services/audio.service";
import { isHydrationAction } from "$/store/enhancers/storage.enhancer";
import type { AppExtraArgs } from "$/store/types";
import createAudioMiddleware from "./audio.middleware";
import createBackupMiddleware from "./backup.middleware";
import createDemoMiddleware from "./demo.middleware";
import createFileMiddleware from "./file.middleware";
import createHistoryMiddleware from "./history.middleware";
import createPackagingMiddleware from "./packaging.middleware";
import createPlaybackMiddleware from "./playback.middleware";

interface Options {
	extraArgument: AppExtraArgs;
}

export function createAppMiddleware({ extraArgument: extra }: Options) {
	const stateSyncMiddleware = createStateSyncMiddleware({
		predicate: (action) => {
			return isHydrationAction(action);
		},
	});

	const songSample = new AudioSample({ volume: 1, playbackRate: 1 });
	const tickSample = new AudioSample({ volume: 1, playbackRate: 1 });

	const audioMiddleware = createAudioMiddleware({ songSample, tickSample, extra });
	const playbackMiddleware = createPlaybackMiddleware({ songSample, extra });
	const fileMiddleware = createFileMiddleware({ extra });
	const downloadMiddleware = createPackagingMiddleware({ extra });
	const demoMiddleware = createDemoMiddleware({ extra });
	const historyMiddleware = createHistoryMiddleware({ extra });
	const backupMiddleware = createBackupMiddleware({ extra });

	return [stateSyncMiddleware as Middleware, audioMiddleware, playbackMiddleware, fileMiddleware, downloadMiddleware, demoMiddleware, historyMiddleware, backupMiddleware];
}
