import type { MouseEventHandler } from "react";
import { Fragment } from "react/jsx-runtime";

import { DefaultActionPanelGroup, NoteDirectionActionPanelGroup, NoteToolActionPanelGroup } from "$/components/app/templates/action-panel-groups";

interface Props {
	handleGridConfigClick: MouseEventHandler;
}
function DefaultActionPanel({ handleGridConfigClick }: Props) {
	return (
		<Fragment>
			<NoteToolActionPanelGroup />
			<NoteDirectionActionPanelGroup />
			<DefaultActionPanelGroup handleGridConfigClick={handleGridConfigClick} />
		</Fragment>
	);
}

export default DefaultActionPanel;
