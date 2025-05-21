import { useCallback } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { decrementEventsEditorZoom, incrementEventsEditorZoom, toggleSelectAllEntities, updateEventsEditorColor, updateEventsEditorEditMode, updateEventsEditorMirrorLock, updateEventsEditorTool, updateEventsEditorWindowLock } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { EventColor, EventEditMode, EventTool, type SongId, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

interface Props {
	sid: SongId;
}
function EventsEditorShortcuts({ sid }: Props) {
	const dispatch = useAppDispatch();

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			switch (ev.code) {
				case "NumpadSubtract":
				case "Minus": {
					return dispatch(decrementEventsEditorZoom());
				}
				case "NumpadAdd":
				// Shift+Equal is "Plus"
				case "Equal": {
					return dispatch(incrementEventsEditorZoom());
				}
				case "KeyA": {
					if (metaKeyPressed) {
						ev.preventDefault();
						return dispatch(toggleSelectAllEntities({ songId: sid, view: View.LIGHTSHOW }));
					}
					return dispatch(updateEventsEditorEditMode({ editMode: EventEditMode.PLACE }));
				}
				case "KeyS": {
					return dispatch(updateEventsEditorEditMode({ editMode: EventEditMode.SELECT }));
				}
				case "KeyZ": {
					if (metaKeyPressed) return;
					ev.stopPropagation();
					return dispatch(updateEventsEditorWindowLock());
				}
				case "KeyX": {
					if (metaKeyPressed) return;
					ev.stopPropagation();
					return dispatch(updateEventsEditorMirrorLock());
				}
				case "Digit1": {
					return dispatch(updateEventsEditorTool({ tool: EventTool.ON }));
				}
				case "Digit2": {
					return dispatch(updateEventsEditorTool({ tool: EventTool.OFF }));
				}
				case "Digit3": {
					return dispatch(updateEventsEditorTool({ tool: EventTool.FLASH }));
				}
				case "Digit4": {
					return dispatch(updateEventsEditorTool({ tool: EventTool.FADE }));
				}
				case "KeyR": {
					if (ev.shiftKey) return;
					return dispatch(updateEventsEditorColor({ color: EventColor.PRIMARY }));
				}
				case "KeyB": {
					if (isMetaKeyPressed(ev)) return;
					if (ev.shiftKey) return;
					return dispatch(updateEventsEditorColor({ color: EventColor.SECONDARY }));
				}
				default: {
					return;
				}
			}
		},
		[dispatch, sid],
	);

	useGlobalEventListener("keydown", handleKeyDown);

	return null;
}

export default EventsEditorShortcuts;
