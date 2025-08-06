import type { MouseEventHandler } from "react";
import { Fragment } from "react/jsx-runtime";

import { DefaultActionPanelGroup, NoteDirectionActionPanelGroup, NoteToolActionPanelGroup } from "$/components/app/templates/action-panel-groups";
import type { BeatmapId, SongId } from "$/types";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanel({ sid, bid, handleGridConfigClick }: Props) {
	return (
		<Fragment>
			<NoteToolActionPanelGroup sid={sid} bid={bid} />
			<NoteDirectionActionPanelGroup />
			<DefaultActionPanelGroup sid={sid} handleGridConfigClick={handleGridConfigClick} />
		</Fragment>
	);
}

export default DefaultActionPanel;
