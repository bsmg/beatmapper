import { useEffect } from "react";

import { selectEventEditMode, selectTool, toggleEventWindowLock, toggleLaserLock, toggleSelectAll, zoomIn, zoomOut } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { EventEditMode, EventTool, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

const KeyboardShortcuts = () => {
	const dispatch = useAppDispatch();

	const handleKeyDown = (ev: KeyboardEvent) => {
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
				if (isMetaKeyPressed(ev)) {
					ev.preventDefault();
					return dispatch(toggleSelectAll({ view: View.LIGHTSHOW }));
				}

				return dispatch(selectEventEditMode({ editMode: EventEditMode.PLACE }));
			}

			case "KeyS": {
				return dispatch(selectEventEditMode({ editMode: EventEditMode.SELECT }));
			}

			case "KeyZ": {
				if (isMetaKeyPressed(ev)) {
					return;
				}

				ev.stopPropagation();
				return dispatch(toggleEventWindowLock());
			}

			case "KeyX": {
				if (isMetaKeyPressed(ev)) {
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
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	});

	return null;
};

export default KeyboardShortcuts;
