import { useThrottledCallback } from "@tanstack/react-pacer";
import { Fragment, useCallback, useRef } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { useViewFromLocation } from "$/components/app/hooks";
import { useGlobalEventListener } from "$/components/hooks";
import { Input } from "$/components/ui/compositions";
import { PromptDialogProvider } from "$/components/ui/compositions/dialog";
import { SNAPPING_INCREMENTS } from "$/constants";
import {
	copySelection,
	cutSelection,
	cycleToNextTool,
	cycleToPrevTool,
	decrementSnap,
	deselectAllEntities,
	downloadMapFiles,
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
	scrollThroughSong,
	seekBackwards,
	seekForwards,
	togglePlaying,
	undoEvents,
	undoObjects,
	updateSnap,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectPacerWait } from "$/store/selectors";
import { type SongId, View } from "$/types";
import { isMetaKeyPressed } from "$/utils";
import { useAddBookmarkPrompt, useJumpToBeatPrompt, useQuickSelectPrompt } from "../../hooks/prompts.hooks";

interface Props {
	sid: SongId;
}

function DefaultEditorShortcuts({ sid }: Props) {
	const dispatch = useAppDispatch();
	const view = useViewFromLocation();
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const wait = useAppSelector(selectPacerWait);

	const { dialog: quickSelectPrompt, handler: handleQuickSelect } = useQuickSelectPrompt({ songId: sid });
	const { dialog: jumpToBeatPrompt, handler: handleJumpToBeat } = useJumpToBeatPrompt({ songId: sid });
	const { dialog: addBookmarkPrompt, handler: handleAddBookmark } = useAddBookmarkPrompt({ songId: sid, view });

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
			if (!view) return;
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
					return;
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
					return jumpToBeatPrompt.setOpen(true);
				}
				case "KeyB": {
					if (metaKeyPressed) {
						ev.preventDefault();
						// If they're holding cmd, create a bookmark
						return addBookmarkPrompt.setOpen(true);
					}
					return;
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
					return quickSelectPrompt.setOpen(true);
				}
				default: {
					return;
				}
			}
		},
		[dispatch, sid, view, handleScroll, isDemo, quickSelectPrompt, jumpToBeatPrompt, addBookmarkPrompt],
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

	return (
		<Fragment>
			<PromptDialogProvider
				value={quickSelectPrompt}
				title="Quick-select"
				description="Quick-select all entities in a given range of beats:"
				placeholder="16-32"
				render={({ state, placeholder, setState }) => <Input value={state} placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
				onSubmit={handleQuickSelect}
			/>
			<PromptDialogProvider
				value={jumpToBeatPrompt}
				title="Jump to Beat"
				description="Enter the beat number you wish to jump to:"
				placeholder="8"
				render={({ state, placeholder, setState }) => <Input value={state} type="number" placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
				onSubmit={handleJumpToBeat}
			/>
			<PromptDialogProvider
				value={addBookmarkPrompt}
				title="Add Bookmark"
				description="Enter a name for this bookmark:"
				placeholder="Start"
				render={({ state, placeholder, setState }) => <Input value={state} placeholder={placeholder} onChange={(e) => e.preventDefault()} onValueChange={(details) => setState(details.valueAsString)} />}
				onSubmit={handleAddBookmark}
			/>
		</Fragment>
	);
}

export default DefaultEditorShortcuts;
