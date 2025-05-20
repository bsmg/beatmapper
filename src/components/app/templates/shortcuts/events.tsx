import { useCallback } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { selectEventEditMode, selectTool, toggleEventWindowLock, toggleLaserLock, toggleSelectAll, zoomIn, zoomOut } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { EventEditMode, EventTool, type SongId, View } from "$/types";
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
					return zoomOut();
				}
				case "Equal": {
					if (ev.shiftKey) {
						// Shift+Equal is "Plus"
						return dispatch(zoomIn());
					}

					break;
				}
				case "NumpadAdd": {
					return dispatch(zoomIn());
				}

				case "KeyA": {
					if (metaKeyPressed) {
						ev.preventDefault();
						return dispatch(toggleSelectAll({ songId: sid, view: View.LIGHTSHOW }));
					}

					return dispatch(selectEventEditMode({ editMode: EventEditMode.PLACE }));
				}

				case "KeyS": {
					return dispatch(selectEventEditMode({ editMode: EventEditMode.SELECT }));
				}

				case "KeyZ": {
					if (metaKeyPressed) {
						return;
					}

					ev.stopPropagation();
					return dispatch(toggleEventWindowLock());
				}

				case "KeyX": {
					if (metaKeyPressed) {
						return;
					}

					ev.stopPropagation();
					return dispatch(toggleLaserLock());
				}

				case "Digit1": {
					return dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.ON }));
				}
				case "Digit2": {
					return dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.OFF }));
				}
				case "Digit3": {
					return dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.FLASH }));
				}
				case "Digit4": {
					return dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.FADE }));
				}

				default:
					return;
			}
		},
		[dispatch, sid],
	);

	useGlobalEventListener("keydown", handleKeyDown);

	return null;
}

export default EventsEditorShortcuts;
