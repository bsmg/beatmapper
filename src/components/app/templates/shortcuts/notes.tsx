import { useParams, useRouteContext } from "@tanstack/react-router";
import { NoteDirection } from "bsmap";
import { useCallback, useRef } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { usePrompter } from "$/components/ui/compositions";
import { mirrorSelection, toggleSelectAllEntities, updateNotesEditorDirection, updateNotesEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectGridSize, selectLoading } from "$/store/selectors";
import { ObjectTool } from "$/types";
import { isMetaKeyPressed } from "$/utils";

function NotesEditorShortcuts() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const grid = useAppSelector((state) => selectGridSize(state, sid));

	const { isPromptActive } = usePrompter();

	const keysDepressed = useRef({
		w: false,
		a: false,
		s: false,
		d: false,
	});

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (isPromptActive) return;

			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			switch (ev.code) {
				case "Digit1": {
					// Ignore meta+number, since that's used for snapping intervals
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE));
				}
				case "Digit2": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE));
				}
				case "Digit3": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool(ObjectTool.BOMB_NOTE));
				}
				case "Digit4": {
					if (metaKeyPressed) return;
					return dispatch(updateNotesEditorTool(ObjectTool.OBSTACLE));
				}
				case "KeyR": {
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorTool(ObjectTool.LEFT_NOTE));
				}
				case "KeyB": {
					if (isMetaKeyPressed(ev)) return;
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorTool(ObjectTool.RIGHT_NOTE));
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
						return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
					}
					if (keysDepressed.current.d) {
						return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
					}
					return dispatch(updateNotesEditorDirection(NoteDirection.UP));
				}
				case "KeyA": {
					if (ev.shiftKey) return;
					if (metaKeyPressed) {
						ev.preventDefault();
						return dispatch(toggleSelectAllEntities({ songId: sid, view }));
					}
					keysDepressed.current.a = true;
					if (keysDepressed.current.w) {
						return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
					}
					if (keysDepressed.current.s) {
						return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
					}
					return dispatch(updateNotesEditorDirection(NoteDirection.LEFT));
				}
				case "KeyS": {
					if (metaKeyPressed) return;
					if (ev.shiftKey) return;
					keysDepressed.current.s = true;
					if (keysDepressed.current.a) {
						return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
					}
					if (keysDepressed.current.d) {
						return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
					}
					return dispatch(updateNotesEditorDirection(NoteDirection.DOWN));
				}
				case "KeyD": {
					if (ev.shiftKey) return;
					keysDepressed.current.d = true;
					if (keysDepressed.current.w) {
						return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
					}
					if (keysDepressed.current.s) {
						return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
					}
					return dispatch(updateNotesEditorDirection(NoteDirection.RIGHT));
				}
				case "KeyF": {
					if (ev.shiftKey) return;
					return dispatch(updateNotesEditorDirection(NoteDirection.ANY));
				}
				case "Numpad1": {
					return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_LEFT));
				}
				case "Numpad2": {
					return dispatch(updateNotesEditorDirection(NoteDirection.DOWN));
				}
				case "Numpad3": {
					return dispatch(updateNotesEditorDirection(NoteDirection.DOWN_RIGHT));
				}
				case "Numpad4": {
					return dispatch(updateNotesEditorDirection(NoteDirection.LEFT));
				}
				case "Numpad5": {
					return dispatch(updateNotesEditorDirection(NoteDirection.ANY));
				}
				case "Numpad6": {
					return dispatch(updateNotesEditorDirection(NoteDirection.RIGHT));
				}
				case "Numpad7": {
					return dispatch(updateNotesEditorDirection(NoteDirection.UP_LEFT));
				}
				case "Numpad8": {
					return dispatch(updateNotesEditorDirection(NoteDirection.UP));
				}
				case "Numpad9": {
					return dispatch(updateNotesEditorDirection(NoteDirection.UP_RIGHT));
				}
				default: {
					return;
				}
			}
		},
		[isLoading, isPromptActive, dispatch, sid, view, grid],
	);

	const handleKeyUp = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (isPromptActive) return;

			const metaKeyPressed = isMetaKeyPressed(ev, navigator);

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
					if (metaKeyPressed) return;
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
		},
		[isLoading, isPromptActive],
	);

	useGlobalEventListener("keydown", handleKeyDown);
	useGlobalEventListener("keyup", handleKeyUp);

	return null;
}

export default NotesEditorShortcuts;
