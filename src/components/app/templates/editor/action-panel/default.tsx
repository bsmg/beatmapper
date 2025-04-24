import type { MouseEventHandler } from "react";
import { Fragment } from "react/jsx-runtime";

import type { SongId } from "$/types";

import { DefaultActionPanelGroup, NoteDirectionActionPanelGroup, NoteToolActionPanelGroup } from "$/components/app/templates/action-panel-groups";

interface Props {
	sid: SongId;
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanel({ sid, handleGridConfigClick }: Props) {
	return (
		<Fragment>
			<NoteToolActionPanelGroup sid={sid} />
			<NoteDirectionActionPanelGroup />
			<DefaultActionPanelGroup sid={sid} handleGridConfigClick={handleGridConfigClick} />
		</Fragment>
	);
}

export default DefaultActionPanel;
