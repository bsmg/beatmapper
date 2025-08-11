import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useCallback, useRef } from "react";

import { useAppPrompterContext } from "$/components/app/compositions";
import { APP_TOASTER } from "$/components/app/constants";
import { useViewFromLocation } from "$/components/app/hooks";
import { useGlobalEventListener } from "$/components/hooks";
import { SNAPPING_INCREMENTS } from "$/constants";
import {
	copySelection,
	cutSelection,
	cycleToNextTool,
	cycleToPrevTool,
	decrementPlaybackRate,
	decrementSnap,
	deselectAllEntities,
	downloadMapFiles,
	incrementPlaybackRate,
	incrementSnap,
	jumpToEnd,
	jumpToStart,
	nudgeSelection,
	pasteSelection,
	redoEvents,
	redoObjects,
	rehydrate,
	removeAllSelectedEvents,
	removeAllSelectedObjects,
	saveBeatmapContents,
	scrollThroughSong,
	seekBackwards,
	seekForwards,
	togglePlaying,
	undoEvents,
	undoObjects,
	updateSnap,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectLoading, selectPacerWait } from "$/store/selectors";
import { type SongId, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

interface Props {
	sid: SongId;
}

function DefaultEditorShortcuts({ sid }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const isLoading = useAppSelector(selectLoading);
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const wait = useAppSelector(selectPacerWait);

	const { active: activePrompt, openPrompt } = useAppPrompterContext();

	const keysDepressed = useRef({
		space: false,
	});

	// This handler handles mousewheel events, as well as up/down/left/right arrow keys.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards", ev: KeyboardEvent | WheelEvent) => {
			const metaKeyPressed = isMetaKeyPressed(ev, navigator);

			// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
			if (metaKeyPressed) {
				return dispatch(direction === "forwards" ? decrementSnap() : incrementSnap());
			}
			if (ev.altKey) {
				return dispatch(nudgeSelection({ view, direction }));
			}
			if (ev.shiftKey) return;

			dispatch(scrollThroughSong({ songId: sid, direction }));
		},
		{ wait: wait },
	);

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (!view) return;
			if (activePrompt) return;

			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			// If the control key and a number is pressed, we want to update snapping.
			if (metaKeyPressed && !Number.isNaN(Number(ev.key))) {
				ev.preventDefault();
				const newSnappingIncrement = SNAPPING_INCREMENTS.find((increment) => increment.shortcutKey === Number(ev.key));
				// ctrl+0 doesn't do anything atm
				if (!newSnappingIncrement) return;
				dispatch(updateSnap({ value: newSnappingIncrement.value }));
			}

			switch (ev.code) {
				case "F5": {
					if (ev.shiftKey) {
						ev.preventDefault();
						return dispatch(rehydrate());
					}
					ev.preventDefault();
					return Promise.resolve(dispatch(saveBeatmapContents({ songId: sid }))).then(() => window.location.reload());
				}
				case "Space": {
					// If the user holds down the space, we don't want to register a bunch of play/pause events.
					if (keysDepressed.current.space) return;
					keysDepressed.current.space = true;
					return dispatch(togglePlaying({ songId: sid }));
				}
				case "Escape": {
					return dispatch(deselectAllEntities({ view }));
				}
				case "Tab": {
					ev.preventDefault();
					return dispatch(ev.shiftKey ? cycleToPrevTool({ view }) : cycleToNextTool({ view }));
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
					return dispatch(jumpToStart({ songId: sid }));
				}
				case "End": {
					return dispatch(jumpToEnd({ songId: sid }));
				}
				case "NumpadSubtract":
				case "Minus": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(decrementPlaybackRate());
				}
				case "NumpadAdd":
				case "Equal": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(incrementPlaybackRate());
				}
				case "Delete": {
					if (view === View.LIGHTSHOW) {
						return dispatch(removeAllSelectedEvents());
					}
					if (view === View.BEATMAP) {
						return dispatch(removeAllSelectedObjects());
					}
					return;
				}
				case "KeyX": {
					if (!metaKeyPressed) return;
					return dispatch(cutSelection({ view }));
				}
				case "KeyC": {
					if (!metaKeyPressed) return;
					return dispatch(copySelection({ view }));
				}
				case "KeyV": {
					if (!metaKeyPressed) return;
					return dispatch(pasteSelection({ songId: sid, view }));
				}
				case "KeyJ": {
					ev.preventDefault();
					return openPrompt("JUMP_TO_BEAT");
				}
				case "KeyB": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return openPrompt("ADD_BOOKMARK");
				}
				case "KeyZ": {
					if (!metaKeyPressed) return;
					if (view === View.BEATMAP) {
						return dispatch(ev.shiftKey ? redoObjects({ songId: sid }) : undoObjects({ songId: sid }));
					}
					if (view === View.LIGHTSHOW) {
						return dispatch(ev.shiftKey ? redoEvents({ songId: sid }) : undoEvents({ songId: sid }));
					}
					return;
				}
				case "KeyS": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(saveBeatmapContents({ songId: sid }));
				}
				case "KeyP": {
					if (!metaKeyPressed) return;
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
					ev.preventDefault();
					return openPrompt("QUICK_SELECT");
				}
				default: {
					return;
				}
			}
		},
		[isLoading, view, activePrompt, dispatch, sid, isDemo, handleScroll, openPrompt],
	);

	const handleKeyUp = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (!view) return;
			if (activePrompt) return;

			switch (ev.code) {
				case "Space": {
					keysDepressed.current.space = false;
					break;
				}
				default:
					return;
			}
		},
		[isLoading, view, activePrompt],
	);

	const handleWheel = useCallback(
		(ev: WheelEvent) => {
			if (isLoading) return;
			if (!view) return;
			if (activePrompt) return;

			if (ev.altKey) return;
			const direction = ev.deltaY > 0 ? "backwards" : "forwards";
			handleScroll(direction, ev);
		},
		[isLoading, view, activePrompt, handleScroll],
	);

	useGlobalEventListener("keydown", handleKeyDown);
	useGlobalEventListener("keyup", handleKeyUp);
	useGlobalEventListener("wheel", handleWheel, { options: { passive: true } });

	return null;
}

export default DefaultEditorShortcuts;
