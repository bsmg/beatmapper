import { useEffect, useRef } from "react";

import { selectNoteDirection, selectTool, swapSelectedNotes, toggleSelectAll } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { Direction, ObjectTool, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

const KeyboardShortcuts = () => {
	const dispatch = useAppDispatch();

	const keysDepressed = useRef({
		w: false,
		a: false,
		s: false,
		d: false,
	});

	const handleKeyDown = (ev: KeyboardEvent) => {
		switch (ev.code) {
			case "Digit1":
				// Ignore meta+number, since that's used for snapping intervals
				if (isMetaKeyPressed(ev)) {
					return;
				}
				return dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.LEFT_NOTE }));
			case "Digit2":
				if (isMetaKeyPressed(ev)) {
					return;
				}
				return dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.RIGHT_NOTE }));
			case "Digit3":
				if (isMetaKeyPressed(ev)) {
					return;
				}
				return dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.BOMB_NOTE }));
			case "Digit4":
				if (isMetaKeyPressed(ev)) {
					return;
				}
				return dispatch(selectTool({ view: View.BEATMAP, tool: ObjectTool.OBSTACLE }));

			case "KeyH": {
				return dispatch(swapSelectedNotes({ axis: "horizontal" }));
			}
			case "KeyV": {
				// If the user is pasting with Meta+V, ignore.
				if (isMetaKeyPressed(ev)) {
					return;
				}
				return dispatch(swapSelectedNotes({ axis: "vertical" }));
			}

			case "KeyW": {
				if (ev.shiftKey) {
					return;
				}
				keysDepressed.current.w = true;

				if (keysDepressed.current.a) {
					return dispatch(selectNoteDirection({ direction: Direction.UP_LEFT }));
				}
				if (keysDepressed.current.d) {
					return dispatch(selectNoteDirection({ direction: Direction.UP_RIGHT }));
				}
				return dispatch(selectNoteDirection({ direction: Direction.UP }));
			}
			case "KeyA": {
				if (ev.shiftKey) {
					return;
				}
				if (isMetaKeyPressed(ev)) {
					ev.preventDefault();
					return dispatch(toggleSelectAll({ view: View.BEATMAP }));
				}

				keysDepressed.current.a = true;

				if (keysDepressed.current.w) {
					return dispatch(selectNoteDirection({ direction: Direction.UP_LEFT }));
				}
				if (keysDepressed.current.s) {
					return dispatch(selectNoteDirection({ direction: Direction.DOWN_LEFT }));
				}
				return dispatch(selectNoteDirection({ direction: Direction.LEFT }));
			}
			case "KeyS": {
				if (ev.shiftKey) {
					return;
				}
				keysDepressed.current.s = true;

				if (keysDepressed.current.a) {
					return dispatch(selectNoteDirection({ direction: Direction.DOWN_LEFT }));
				}
				if (keysDepressed.current.d) {
					return dispatch(selectNoteDirection({ direction: Direction.DOWN_RIGHT }));
				}
				return dispatch(selectNoteDirection({ direction: Direction.DOWN }));
			}
			case "KeyD": {
				if (ev.shiftKey) {
					return;
				}
				keysDepressed.current.d = true;

				if (keysDepressed.current.w) {
					return dispatch(selectNoteDirection({ direction: Direction.UP_RIGHT }));
				}
				if (keysDepressed.current.s) {
					return dispatch(selectNoteDirection({ direction: Direction.DOWN_RIGHT }));
				}
				return dispatch(selectNoteDirection({ direction: Direction.RIGHT }));
			}

			case "KeyF": {
				if (ev.shiftKey) {
					return;
				}

				return dispatch(selectNoteDirection({ direction: Direction.ANY }));
			}

			case "Numpad1": {
				return dispatch(selectNoteDirection({ direction: Direction.DOWN_LEFT }));
			}
			case "Numpad2": {
				return dispatch(selectNoteDirection({ direction: Direction.DOWN }));
			}
			case "Numpad3": {
				return dispatch(selectNoteDirection({ direction: Direction.DOWN_RIGHT }));
			}
			case "Numpad4": {
				return dispatch(selectNoteDirection({ direction: Direction.LEFT }));
			}
			case "Numpad5": {
				return dispatch(selectNoteDirection({ direction: Direction.ANY }));
			}
			case "Numpad6": {
				return dispatch(selectNoteDirection({ direction: Direction.RIGHT }));
			}
			case "Numpad7": {
				return dispatch(selectNoteDirection({ direction: Direction.UP_LEFT }));
			}
			case "Numpad8": {
				return dispatch(selectNoteDirection({ direction: Direction.UP }));
			}
			case "Numpad9": {
				return dispatch(selectNoteDirection({ direction: Direction.UP_RIGHT }));
			}

			default:
				return;
		}
	};

	const handleKeyUp = (ev: KeyboardEvent) => {
		switch (ev.code) {
			case "KeyW": {
				keysDepressed.current.w = false;
				break;
			}
			case "KeyA": {
				keysDepressed.current.a = false;
				break;
			}
			case "KeyS": {
				keysDepressed.current.s = false;
				break;
			}
			case "KeyD": {
				keysDepressed.current.d = false;
				break;
			}

			default:
				return;
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	});

	return null;
};

export default KeyboardShortcuts;
