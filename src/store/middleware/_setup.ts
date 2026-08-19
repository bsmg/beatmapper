import type { Middleware } from "@reduxjs/toolkit";
import { createStateSyncMiddleware } from "redux-state-sync";

import { NOTE_TICK_TYPES } from "$/constants/editor.constants";
import { AudioSample } from "$/services/audio.service";
import type { AppExtraArgs } from "$/store/types";
import { withFluxStandardMeta } from "$/store/utils/guards.utils";
import createAudioMiddleware from "./audio.middleware";
import createBackupMiddleware from "./backup.middleware";
import createEditorMiddleware from "./editor.middleware";
import createEntitiesMiddleware from "./entities.middleware";
import createFileMiddleware from "./file.middleware";
import createHistoryMiddleware from "./history.middleware";
import createPackagingMiddleware from "./packaging.middleware";
import createPlaybackMiddleware from "./playback.middleware";
import createSharedMiddleware from "./shared.middleware";

interface Options {
	extraArgument: AppExtraArgs;
}

export function createAppMiddleware({ extraArgument: extra }: Options) {
	const stateSyncMiddleware = createStateSyncMiddleware({
		predicate: withFluxStandardMeta<{ sync?: boolean }>((meta) => {
			return "sync" in meta && typeof meta.sync === "boolean" && meta.sync === true;
		}),
	});

	const audioContext = extra.getAudioContext();

	const songSample = new AudioSample(audioContext, { volume: 1, playbackRate: 1 });
	const tickSample = new AudioSample(audioContext, { volume: 1, playbackRate: 1 });

	tickSample.load(NOTE_TICK_TYPES[0]);

	const editorMiddleware = createEditorMiddleware({ extra });
	const sharedMiddleware = createSharedMiddleware({ extra });
	const audioMiddleware = createAudioMiddleware({ songSample, tickSample, extra });
	const playbackMiddleware = createPlaybackMiddleware({ songSample, extra });
	const fileMiddleware = createFileMiddleware({ extra });
	const downloadMiddleware = createPackagingMiddleware({ extra });
	const entitiesMiddleware = createEntitiesMiddleware({ extra });
	const historyMiddleware = createHistoryMiddleware({ extra });
	const backupMiddleware = createBackupMiddleware({ extra });

	return [stateSyncMiddleware as Middleware, editorMiddleware, sharedMiddleware, audioMiddleware, playbackMiddleware, fileMiddleware, downloadMiddleware, entitiesMiddleware, historyMiddleware, backupMiddleware];
}
