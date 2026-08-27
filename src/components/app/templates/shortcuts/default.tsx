import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

import { createAddBookmarkPrompt, createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { useToaster } from "$/components/context";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { usePrompt, usePrompter } from "$/components/ui/compositions";
import { SNAPPING_INCREMENTS } from "$/constants";
import { resolveColorForBookmark } from "$/helpers/bookmarks.helpers";
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
	jumpBackwards,
	jumpForwards,
	jumpToBeat,
	jumpToEnd,
	jumpToStart,
	moveBackwards,
	moveForwards,
	nudgeSelection,
	pasteSelection,
	redoEvents,
	redoObjects,
	removeAllSelectedEvents,
	removeAllSelectedObjects,
	saveMapFiles,
	selectAllEntitiesInRange,
	startLoadingMap,
	togglePlayback,
	undoEvents,
	undoObjects,
	updateSnap,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPositionInBeats, selectDemo, selectLoading, selectPacerWait } from "$/store/selectors";
import { View } from "$/types";
import { isMetaKeyPressed } from "$/utils";

function DefaultEditorShortcuts() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const toaster = useToaster();

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const isDemo = useAppSelector((state) => selectDemo(state, sid));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
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
				dispatch(selectAllEntitiesInRange({ startBeat, endBeat }));
				dispatch(jumpToBeat({ value: startBeat }));
			},
		}),
	);
	const { trigger: triggerJumpToBeat } = usePrompt(
		createJumpToBeatPrompt({
			render: ({ form }) => <form.AppField name="beatNum">{(ctx) => <ctx.NumberInput autoFocus label="Beat" placeholder="4" />}</form.AppField>,
			onSubmit: ({ value: { beatNum } }) => dispatch(jumpToBeat({ value: beatNum })),
		}),
	);
	const { trigger: triggerAddBookmark } = usePrompt(
		createAddBookmarkPrompt({
			render: ({ form }) => <form.AppField name="name">{(ctx) => <ctx.Input autoFocus label="Name" />}</form.AppField>,
			onSubmit: ({ value }) => dispatch(addBookmark({ time: cursorPositionInBeats, name: value.name, color: resolveColorForBookmark(value.name) })),
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
				return dispatch(nudgeSelection({ direction }));
			}
			if (ev.shiftKey) return;

			dispatch((direction === "forwards" ? moveForwards : moveBackwards)());
		},
		{ wait: wait },
	);

	const handleRefresh = useCallback(() => dispatch(saveMapFiles()), [dispatch]);

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
						return dispatch(startLoadingMap({ songId: sid, beatmapId: bid }));
					}
					return;
				}
				case "Space": {
					// If the user holds down the space, we don't want to register a bunch of play/pause events.
					if (keysDepressed.current.space) return;
					keysDepressed.current.space = true;
					return dispatch(togglePlayback());
				}
				case "Escape": {
					return dispatch(deselectAllEntities());
				}
				case "Tab": {
					ev.preventDefault();
					return dispatch(ev.shiftKey ? cycleToPrevTool() : cycleToNextTool());
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
					return dispatch(jumpForwards());
				}
				case "PageDown": {
					return dispatch(jumpBackwards());
				}
				case "Home": {
					return dispatch(jumpToStart());
				}
				case "End": {
					return dispatch(jumpToEnd());
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
					return dispatch(cutSelection());
				}
				case "KeyC": {
					if (!metaKeyPressed) return;
					return dispatch(copySelection());
				}
				case "KeyV": {
					if (!metaKeyPressed) return;
					return dispatch(pasteSelection());
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
						return dispatch((ev.shiftKey ? redoObjects : undoObjects)());
					}
					if (view === View.LIGHTSHOW) {
						return dispatch((ev.shiftKey ? redoEvents : undoEvents)());
					}
					return;
				}
				case "KeyS": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(saveMapFiles());
				}
				case "KeyP": {
					if (!metaKeyPressed) return;
					ev.preventDefault();
					if (import.meta.env.PROD && isDemo) {
						return toaster.create({
							id: "demo-download-blocker",
							type: "info",
							description: "Unfortunately, the demo map is not available for download.",
						});
					}
					if (sid) return dispatch(downloadMapFiles({ songId: sid, options: { version: null } }));
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
		[dispatch, toaster, sid, bid, view, isLoading, isDemo, handleScroll, isPromptActive, triggerQuickSelect, triggerJumpToBeat, triggerAddBookmark],
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
