import type { PropsWithChildren } from "react";
import { Fragment } from "react/jsx-runtime";

import { EditorNavigationPanel, EditorSongInfo, EditorStatusBar } from "$/components/app/templates/editor";
import { DefaultEditorShortcuts } from "$/components/app/templates/shortcuts";

interface Props extends PropsWithChildren {
	showBeatmapPicker?: boolean;
}
function EditorViewScene({ showBeatmapPicker, children }: Props) {
	return (
		<Fragment>
			<EditorSongInfo showDifficultySelector={!!showBeatmapPicker} />
			{children}
			<EditorNavigationPanel />
			<EditorStatusBar />
			<DefaultEditorShortcuts />
		</Fragment>
	);
}

export default EditorViewScene;
