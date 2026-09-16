import { useHotkey, useHotkeys, useIsKeyPressed } from "@ark-ui/react/hotkeys";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { createAddBookmarkPrompt, createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { useToaster } from "$/components/context";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { usePrompt } from "$/components/ui/compositions";
import { SNAPPING_INCREMENTS } from "$/constants";
import { resolveColorForBookmark } from "$/helpers/bookmarks.helpers";
import { calculateQuickSelectRange } from "$/helpers/editor.helpers";
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
	saveMapFiles,
	selectAllEntitiesInRange,
	startLoadingMap,
	togglePlayback,
	updateSnap,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPositionInBeats, selectDemo, selectLoading, selectPacerWait } from "$/store/selectors";
import { range } from "$/utils";
import { getScopes } from "./helpers";

function DefaultEditorShortcuts() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

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
				const [startBeat, endBeat] = calculateQuickSelectRange(range, cursorPositionInBeats, 0.01);
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

	const isEnabled = useMemo(() => !isLoading, [isLoading]);

	useHotkey({ hotkey: "Shift+F5", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(startLoadingMap({ songId: sid, beatmapId: bid })) });
	useHotkey({ hotkey: "Space", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(togglePlayback()), options: { requireReset: true } });
	useHotkey({ hotkey: "Escape", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(deselectAllEntities()) });

	useHotkey({ hotkey: "Tab", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(cycleToNextTool()) });
	useHotkey({ hotkey: "Shift+Tab", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(cycleToPrevTool()) });

	useHotkeys({
		commands: Array.from(range(1, 9)).map((num) => {
			return {
				hotkey: `Mod+${num}`,
				scopes: getScopes(),
				enabled: isEnabled,
				action: () => {
					const newSnappingIncrement = SNAPPING_INCREMENTS.find((increment) => increment.shortcutKey === num);
					if (!newSnappingIncrement) return;
					return dispatch(updateSnap(newSnappingIncrement.value));
				},
				options: {
					preventDefault: true,
				},
			};
		}),
	});

	useHotkey({ hotkey: "ArrowUp", scopes: getScopes(), enabled: isEnabled, action: () => handleScroll("forwards") });
	useHotkey({ hotkey: "ArrowDown", scopes: getScopes(), enabled: isEnabled, action: () => handleScroll("backwards") });

	useHotkey({ hotkey: "PageUp", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(jumpForwards()) });
	useHotkey({ hotkey: "PageDown", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(jumpBackwards()) });
	useHotkey({ hotkey: "Home", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(jumpToStart()) });
	useHotkey({ hotkey: "End", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(jumpToEnd()) });

	useHotkey({ hotkey: "Mod+-", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(decrementPlaybackRate()) });
	useHotkey({ hotkey: "Mod+=", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(incrementPlaybackRate()) });

	useHotkey({ hotkey: "Mod+X", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(cutSelection()) });
	useHotkey({ hotkey: "Mod+C", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(copySelection()) });
	useHotkey({ hotkey: "Mod+V", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(pasteSelection()) });

	useHotkey({ hotkey: "Mod+S", scopes: getScopes(), enabled: isEnabled, action: () => dispatch(saveMapFiles()) });

	useHotkey({
		hotkey: "Mod+P",
		scopes: getScopes(),
		enabled: isEnabled,
		action: () => {
			if (import.meta.env.PROD && isDemo) {
				return toaster.create({
					id: "demo-download-blocker",
					type: "info",
					description: "Unfortunately, the demo map is not available for download.",
				});
			}
			return dispatch(downloadMapFiles({ songId: sid, options: { version: null } }));
		},
	});

	useHotkey({ hotkey: "Q", scopes: getScopes(), enabled: isEnabled, action: () => triggerQuickSelect() });
	useHotkey({ hotkey: "J", scopes: getScopes(), enabled: isEnabled, action: () => triggerJumpToBeat() });
	useHotkey({ hotkey: "Mod+B", scopes: getScopes(), enabled: isEnabled, action: () => triggerAddBookmark() });

	const isModKeyPressed = useIsKeyPressed({ hotkey: "Mod" });
	const isAltKeyPressed = useIsKeyPressed({ hotkey: "Alt" });

	// This handler handles mousewheel events, as well as up/down/left/right arrow keys.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards") => {
			if (!isEnabled) return;
			// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
			if (isModKeyPressed) {
				return dispatch(direction === "forwards" ? decrementSnap() : incrementSnap());
			}
			if (isAltKeyPressed) {
				return dispatch(nudgeSelection({ direction }));
			}
			dispatch((direction === "forwards" ? moveForwards : moveBackwards)());
		},
		{ enabled: isEnabled, wait: wait },
	);

	useGlobalEventListener(
		"wheel",
		(event) => {
			if (!isEnabled) return;
			event.preventDefault();
			return handleScroll(event.deltaY > 0 ? "backwards" : "forwards");
		},
		{ options: { passive: false } },
	);

	useGlobalEventListener("beforeunload", () => {
		if (!isEnabled) return;
		return dispatch(saveMapFiles());
	});

	return null;
}

export default DefaultEditorShortcuts;
