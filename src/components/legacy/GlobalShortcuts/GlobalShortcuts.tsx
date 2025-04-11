import { useThrottledCallback } from "@tanstack/react-pacer";
import { useEffect, useRef } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { SNAPPING_INCREMENTS } from "$/constants";
import { promptJumpToBeat, promptQuickSelect } from "$/helpers/prompts.helpers";
import { useMousewheel } from "$/hooks";
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
import { selectActiveSongId, selectIsDemoSong } from "$/store/selectors";
import { View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

interface Props {
	view: View;
}

/**
 * These are shortcuts that are shared among 3 views:
 * - Notes
 * - Events
 * - Demo
 */
const GlobalShortcuts = ({ view }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const isDemo = useAppSelector((state) => selectIsDemoSong(state, songId));
	const dispatch = useAppDispatch();

	const keysDepressed = useRef({
		space: false,
	});

	// This handler handles mousewheel events, as well as up/down/left/right arrow keys.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards", holdingMeta: boolean, holdingAlt: boolean) => {
			// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
			if (holdingMeta) {
				return dispatch(direction === "forwards" ? decrementSnapping() : incrementSnapping());
			}

			if (holdingAlt) {
				return dispatch(nudgeSelection({ direction, view }));
			}

			dispatch(scrollThroughSong({ direction }));
		},
		{ wait: 50 },
	);

	const handleKeyDown = (ev: KeyboardEvent) => {
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

				return dispatch(togglePlaying());
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
				return handleScroll("forwards", metaKeyPressed, ev.altKey);
			}
			case "ArrowDown":
			case "ArrowLeft": {
				return handleScroll("backwards", metaKeyPressed, ev.altKey);
			}

			case "PageUp": {
				return dispatch(seekForwards({ view }));
			}
			case "PageDown": {
				return dispatch(seekBackwards({ view }));
			}

			case "Home": {
				return dispatch(skipToStart());
			}
			case "End": {
				return dispatch(skipToEnd());
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
				return dispatch(pasteSelection({ view }));
			}

			case "KeyJ": {
				return dispatch(promptJumpToBeat(jumpToBeat, { pauseTrack: true }));
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

					return dispatch(createBookmark({ name, view }));
				}
				// Otherwise, toggle the note color to Blue.
				return dispatch(selectColor({ view, color: "blue" }));
			}

			case "KeyZ": {
				if (!metaKeyPressed) {
					return;
				}

				if (view === View.BEATMAP) {
					return dispatch(ev.shiftKey ? redoNotes() : undoNotes());
				}
				if (view === View.LIGHTSHOW) {
					return dispatch(ev.shiftKey ? redoEvents() : undoEvents());
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
				if (songId) return dispatch(downloadMapFiles({ songId, version: 2 }));
				return;
			}

			case "KeyQ": {
				return dispatch(promptQuickSelect(view, selectAllInRange));
			}

			default:
				return;
		}
	};

	const handleKeyUp = (ev: KeyboardEvent) => {
		switch (ev.code) {
			case "Space": {
				keysDepressed.current.space = false;
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

	useMousewheel((ev) => {
		const metaKeyPressed = isMetaKeyPressed(ev, navigator);

		const direction = ev.deltaY > 0 ? "backwards" : "forwards";

		handleScroll(direction, metaKeyPressed, ev.altKey);
	});

	return null;
};

export default GlobalShortcuts;
