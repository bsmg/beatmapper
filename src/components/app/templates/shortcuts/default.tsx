import { useThrottledCallback } from "@tanstack/react-pacer";
import { useCallback, useRef } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { useViewFromLocation } from "$/components/app/hooks";
import { useGlobalEventListener } from "$/components/hooks";
import { SNAPPING_INCREMENTS } from "$/constants";
import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import {
	changeSnapping,
	copySelection,
	createBookmark,
	cutSelection,
	decrementSnapping,
	deleteSelectedEvents,
	deleteSelectedNotes,
	deselectAll,
	downloadMapFiles,
	incrementSnapping,
	jumpToBeat,
	nudgeSelection,
	pasteSelection,
	redoEvents,
	redoNotes,
	rehydrate,
	scrollThroughSong,
	seekBackwards,
	seekForwards,
	selectAllInRange,
	selectColor,
	selectNextTool,
	selectPreviousTool,
	skipToEnd,
	skipToStart,
	togglePlaying,
	undoEvents,
	undoNotes,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsDemoSong } from "$/store/selectors";
import { type SongId, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

interface Props {
	sid: SongId;
}
/**
 * These are shortcuts that are shared among 3 views:
 * - Notes
 * - Events
 * - Demo
 */
function DefaultEditorShortcuts({ sid }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const isDemo = useAppSelector((state) => selectIsDemoSong(state, sid));

	const keysDepressed = useRef({
		space: false,
	});

	// This handler handles mousewheel events, as well as up/down/left/right arrow keys.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards", ev: KeyboardEvent | WheelEvent) => {
			if (!view) return;
			const metaKeyPressed = isMetaKeyPressed(ev, navigator);

			// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
			if (metaKeyPressed) {
				return dispatch(direction === "forwards" ? decrementSnapping() : incrementSnapping());
			}
			if (ev.altKey) {
				return dispatch(nudgeSelection({ view, direction }));
			}
			if (ev.shiftKey) {
				return;
			}
			dispatch(scrollThroughSong({ songId: sid, direction }));
		},
		{ wait: 50 },
	);

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (!view) return;
			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			// If the control key and a number is pressed, we want to update snapping.
			if (metaKeyPressed && !Number.isNaN(Number(ev.key))) {
				ev.preventDefault();

				const newSnappingIncrement = SNAPPING_INCREMENTS.find((increment) => increment.shortcutKey === Number(ev.key));

				// ctrl+0 doesn't do anything atm
				if (!newSnappingIncrement) {
					return;
				}

				dispatch(changeSnapping({ newSnapTo: newSnappingIncrement.value }));
			}

			switch (ev.code) {
				case "F5": {
					if (!ev.shiftKey) {
						ev.preventDefault();
						return;
					}
					return dispatch(rehydrate());
				}

				case "Space": {
					// If the user holds down the space, we don't want to register a bunch of play/pause events.
					if (keysDepressed.current.space) {
						return;
					}

					keysDepressed.current.space = true;

					return dispatch(togglePlaying({ songId: sid }));
				}

				case "Escape": {
					return dispatch(deselectAll({ view }));
				}

				case "Tab": {
					ev.preventDefault();
					return dispatch(ev.shiftKey ? selectPreviousTool({ view }) : selectNextTool({ view }));
				}

				case "ArrowUp":
				case "ArrowRight": {
					return handleScroll("forwards", ev);
				}
				case "ArrowDown":
				case "ArrowLeft": {
					return handleScroll("backwards", ev);
				}

				case "PageUp": {
					return dispatch(seekForwards({ songId: sid, view }));
				}
				case "PageDown": {
					return dispatch(seekBackwards({ songId: sid, view }));
				}

				case "Home": {
					return dispatch(skipToStart({ songId: sid }));
				}
				case "End": {
					return dispatch(skipToEnd({ songId: sid }));
				}

				case "Delete": {
					if (view === View.LIGHTSHOW) {
						return dispatch(deleteSelectedEvents());
					}
					if (view === View.BEATMAP) {
						return dispatch(deleteSelectedNotes());
					}

					return;
				}

				case "KeyX": {
					if (!metaKeyPressed) {
						return;
					}

					return dispatch(cutSelection({ view }));
				}
				case "KeyC": {
					if (!metaKeyPressed) {
						return;
					}
					return dispatch(copySelection({ view }));
				}
				case "KeyV": {
					if (!metaKeyPressed) {
						return;
					}
					return dispatch(pasteSelection({ songId: sid, view }));
				}

				case "KeyJ": {
					return dispatch(promptJumpToBeat(jumpToBeat, { songId: sid, pauseTrack: true }));
				}

				case "KeyR": {
					if (ev.shiftKey) {
						return;
					}
					return dispatch(selectColor({ view, color: "red" }));
				}
				case "KeyB": {
					if (metaKeyPressed) {
						// If they're holding cmd, create a bookmark
						const name = window.prompt("Enter a name for this bookmark");

						if (!name) {
							return;
						}

						return dispatch(createBookmark({ songId: sid, name, view }));
					}
					// Otherwise, toggle the note color to Blue.
					return dispatch(selectColor({ view, color: "blue" }));
				}

				case "KeyZ": {
					if (!metaKeyPressed) {
						return;
					}

					if (view === View.BEATMAP) {
						return dispatch(ev.shiftKey ? redoNotes({ songId: sid }) : undoNotes({ songId: sid }));
					}
					if (view === View.LIGHTSHOW) {
						return dispatch(ev.shiftKey ? redoEvents({ songId: sid }) : undoEvents({ songId: sid }));
					}
					return;
				}

				case "KeyS": {
					if (!metaKeyPressed) {
						return;
					}

					ev.preventDefault();
					if (import.meta.env.PROD && isDemo) {
						return APP_TOASTER.create({
							id: "demo-download-blocker",
							type: "info",
							description: "Unfortunately, the demo map is not available for download.",
						});
					}
					if (sid) return dispatch(downloadMapFiles({ songId: sid }));
					return;
				}

				case "KeyQ": {
					return dispatch(promptQuickSelect(selectAllInRange, { songId: sid, view }));
				}

				default:
					return;
			}
		},
		[dispatch, sid, view, handleScroll, isDemo],
	);

	const handleKeyUp = useCallback(
		(ev: KeyboardEvent) => {
			if (!view) return;
			switch (ev.code) {
				case "Space": {
					keysDepressed.current.space = false;
					break;
				}
				default:
					return;
			}
		},
		[view],
	);

	const handleWheel = useCallback(
		(ev: WheelEvent) => {
			if (ev.altKey) return;
			const direction = ev.deltaY > 0 ? "backwards" : "forwards";
			handleScroll(direction, ev);
		},
		[handleScroll],
	);

	useGlobalEventListener("keydown", handleKeyDown);
	useGlobalEventListener("keyup", handleKeyUp);
	useGlobalEventListener("wheel", handleWheel, { options: { passive: true } });

	return null;
}

export default DefaultEditorShortcuts;
