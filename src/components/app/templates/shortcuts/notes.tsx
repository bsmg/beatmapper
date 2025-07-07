import { NoteDirection } from "bsmap";
import { useCallback, useRef } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { mirrorSelection, toggleSelectAllEntities, updateNotesEditorDirection, updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridSize } from "$/store/selectors";
import { ObjectTool, type SongId, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

interface Props {
	sid: SongId;
}
function NotesEditorShortcuts({ sid }: Props) {
	const dispatch = useAppDispatch();
	const grid = useAppSelector((state) => selectGridSize(state, sid));

	const keysDepressed = useRef({
		w: false,
		a: false,
		s: false,
		d: false,
	});

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			switch (ev.code) {
				case "Digit1": {
					// Ignore meta+number, since that's used for snapping intervals
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.LEFT_NOTE }));
				}
				case "Digit2": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.RIGHT_NOTE }));
				}
				case "Digit3": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.BOMB_NOTE }));
				}
				case "Digit4": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.OBSTACLE }));
				}
				case "KeyR": {
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.LEFT_NOTE }));
				}
				case "KeyB": {
					if (isMetaKeyPressed(ev)) return;
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorTool({ tool: ObjectTool.RIGHT_NOTE }));
				}
				case "KeyH": {
					return dispatch(mirrorSelection({ axis: "horizontal", grid }));
				}
				case "KeyV": {
					// If the user is pasting with Meta+V, ignore.
					if (metaKeyPressed) return;
					return dispatch(mirrorSelection({ axis: "vertical", grid }));
				}
				case "KeyW": {
					if (ev.shiftKey) return;
					keysDepressed.current.w = true;
					if (keysDepressed.current.a) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_LEFT }));
					}
					if (keysDepressed.current.d) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_RIGHT }));
					}
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP }));
				}
				case "KeyA": {
					if (ev.shiftKey) return;
					if (metaKeyPressed) {
						ev.preventDefault();
						return dispatch(toggleSelectAllEntities({ songId: sid, view: View.BEATMAP }));
					}
					keysDepressed.current.a = true;
					if (keysDepressed.current.w) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_LEFT }));
					}
					if (keysDepressed.current.s) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_LEFT }));
					}
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.LEFT }));
				}
				case "KeyS": {
					if (ev.shiftKey) return;
					keysDepressed.current.s = true;
					if (keysDepressed.current.a) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_LEFT }));
					}
					if (keysDepressed.current.d) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_RIGHT }));
					}
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN }));
				}
				case "KeyD": {
					if (ev.shiftKey) return;
					keysDepressed.current.d = true;
					if (keysDepressed.current.w) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_RIGHT }));
					}
					if (keysDepressed.current.s) {
						return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_RIGHT }));
					}
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.RIGHT }));
				}
				case "KeyF": {
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.ANY }));
				}
				case "Numpad1": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_LEFT }));
				}
				case "Numpad2": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN }));
				}
				case "Numpad3": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.DOWN_RIGHT }));
				}
				case "Numpad4": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.LEFT }));
				}
				case "Numpad5": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.ANY }));
				}
				case "Numpad6": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.RIGHT }));
				}
				case "Numpad7": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_LEFT }));
				}
				case "Numpad8": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP }));
				}
				case "Numpad9": {
					return dispatch(updateNotesEditorDirection({ direction: NoteDirection.UP_RIGHT }));
				}
				default: {
					return;
				}
			}
		},
		[dispatch, sid, grid],
	);

	const handleKeyUp = useCallback((ev: KeyboardEvent) => {
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
	}, []);

	useGlobalEventListener("keydown", handleKeyDown);
	useGlobalEventListener("keyup", handleKeyUp);

	return null;
}

export default NotesEditorShortcuts;
