import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

import { createAddBookmarkPrompt, createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { useSetupContext } from "$/components/context";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { usePrompt, usePrompter } from "$/components/ui/compositions";
import { SNAPPING_INCREMENTS } from "$/constants";
import {
	addBookmark,
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
	jumpToBeat,
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
	selectAllEntitiesInRange,
	togglePlayback,
	undoEvents,
	undoObjects,
	updateSnap,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectLoading, selectPacerWait } from "$/store/selectors";
import { View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

function DefaultEditorShortcuts() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const { toaster } = useSetupContext();

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const wait = useAppSelector(selectPacerWait);

	const { trigger: triggerQuickSelect } = usePrompt(
		createQuickSelectPrompt({
			render: ({ form }) => <form.AppField name="range">{(ctx) => <ctx.Input autoFocus label="Range" placeholder="8-12" />}</form.AppField>,
			onSubmit: ({ value: { range } }) => {
				let [startBeat, endBeat] = range
					.trim()
					.split("-")
					.map((x) => Number.parseFloat(x));
				if (typeof endBeat !== "number") {
					endBeat = Number.POSITIVE_INFINITY;
				}
				dispatch(selectAllEntitiesInRange({ songId: sid, view: view, startBeat, endBeat }));
				dispatch(jumpToBeat({ songId: sid, value: startBeat, pauseTrack: true }));
			},
		}),
	);
	const { trigger: triggerJumpToBeat } = usePrompt(
		createJumpToBeatPrompt({
			render: ({ form }) => <form.AppField name="beatNum">{(ctx) => <ctx.NumberInput autoFocus label="Beat" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value: { beatNum } }) => dispatch(jumpToBeat({ songId: sid, pauseTrack: true, value: beatNum })),
		}),
	);
	const { trigger: triggerAddBookmark } = usePrompt(
		createAddBookmarkPrompt({
			render: ({ form }) => <form.AppField name="name">{(ctx) => <ctx.Input autoFocus label="Name" />}</form.AppField>,
			onSubmit: ({ value }) => dispatch(addBookmark({ songId: sid, view, name: value.name })),
		}),
	);

	const { isPromptActive } = usePrompter();

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

	const handleRefresh = useCallback(() => {
		dispatch(saveBeatmapContents({ songId: sid }));
	}, [dispatch, sid]);

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (!view) return;
			if (isPromptActive) return;

			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			// If the control key and a number is pressed, we want to update snapping.
			if (metaKeyPressed && !Number.isNaN(Number(ev.key))) {
				ev.preventDefault();
				const newSnappingIncrement = SNAPPING_INCREMENTS.find((increment) => increment.shortcutKey === Number(ev.key));
				// ctrl+0 doesn't do anything atm
				if (!newSnappingIncrement) return;
				dispatch(updateSnap(newSnappingIncrement.value));
			}

			switch (ev.code) {
				case "F5": {
					if (ev.shiftKey) {
						ev.preventDefault();
						return dispatch(rehydrate({ songId: sid, beatmapId: bid }));
					}
					return;
				}
				case "Space": {
					// If the user holds down the space, we don't want to register a bunch of play/pause events.
					if (keysDepressed.current.space) return;
					keysDepressed.current.space = true;
					return dispatch(togglePlayback({ songId: sid }));
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
					return dispatch(seekForwards({ songId: sid }));
				}
				case "PageDown": {
					return dispatch(seekBackwards({ songId: sid }));
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
					return triggerJumpToBeat();
				}
				case "KeyB": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return triggerAddBookmark();
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
						return toaster?.create({
							id: "demo-download-blocker",
							type: "info",
							description: "Unfortunately, the demo map is not available for download.",
						});
					}
					if (sid) return dispatch(downloadMapFiles({ songId: sid, version: null }));
					return;
				}
				case "KeyQ": {
					ev.preventDefault();
					return triggerQuickSelect();
				}
				default: {
					return;
				}
			}
		},
		[isLoading, view, dispatch, toaster, sid, bid, isDemo, handleScroll, isPromptActive, triggerQuickSelect, triggerJumpToBeat, triggerAddBookmark],
	);

	const handleKeyUp = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (!view) return;
			if (isPromptActive) return;

			switch (ev.code) {
				case "Space": {
					keysDepressed.current.space = false;
					break;
				}
				default:
					return;
			}
		},
		[isLoading, view, isPromptActive],
	);

	const handleWheel = useCallback(
		(ev: WheelEvent) => {
			ev.preventDefault();
			if (isLoading) return;
			if (!view) return;
			if (isPromptActive) return;

			if (ev.altKey) return;
			const direction = ev.deltaY > 0 ? "backwards" : "forwards";
			handleScroll(direction, ev);
		},
		[isLoading, view, isPromptActive, handleScroll],
	);

	useGlobalEventListener("keydown", handleKeyDown);
	useGlobalEventListener("keyup", handleKeyUp);
	useGlobalEventListener("wheel", handleWheel, { options: { passive: false } });

	useGlobalEventListener("beforeunload", handleRefresh);

	return null;
}

export default DefaultEditorShortcuts;
