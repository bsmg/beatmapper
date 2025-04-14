import type { PropsWithChildren } from "react";
import { Fragment } from "react/jsx-runtime";

import type { BeatmapId, SongId } from "$/types";

import { EditorNavigationPanel, EditorSongInfo, EditorStatusBar } from "$/components/app/templates/editor";
import { EditorDefaultShortcuts } from "$/components/app/templates/shortcuts";

interface Props extends PropsWithChildren {
	sid: SongId;
	bid: BeatmapId;
	showBeatmapPicker?: boolean;
}
function EditorViewScene({ sid, bid, showBeatmapPicker, children }: Props) {
	return (
		<Fragment>
			<EditorSongInfo sid={sid} bid={bid} showDifficultySelector={!!showBeatmapPicker} />
			{children}
			<EditorNavigationPanel sid={sid} />
			<EditorStatusBar sid={sid} />
			<EditorDefaultShortcuts sid={sid} />
		</Fragment>
	);
}

export default EditorViewScene;
