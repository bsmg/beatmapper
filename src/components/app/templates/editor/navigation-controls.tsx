import { useHotkey, useHotkeyStore, useHotkeys, useIsKeyPressed } from "@ark-ui/react/hotkeys";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useParams } from "@tanstack/react-router";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

import { createAddBookmarkPrompt, createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { NavigationPanel } from "$/components/app/layouts";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Button, Input, Stat, usePrompt } from "$/components/ui/compositions";
import { formatCursorPosition, formatCursorPositionInBeats } from "$/helpers/audio.helpers";
import { resolveColorForBookmark } from "$/helpers/bookmarks.helpers";
import { calculateQuickSelectRange } from "$/helpers/editor.helpers";
import { addBookmark, decrementSnap, incrementSnap, jumpBackwards, jumpForwards, jumpToBeat, jumpToEnd, jumpToStart, moveBackwards, moveForwards, selectAllEntitiesInRange, togglePlayback, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectLoading, selectPacerWait, selectPlaying, selectSnap } from "$/store/selectors";
import { clamp, range, roundToNearest } from "$/utils";
import { Text } from "$:styled-system/jsx";

function EditorNavigationControls() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isPlaying = useAppSelector(selectPlaying);
	const isLoadingSong = useAppSelector(selectLoading);
	const snapTo = useAppSelector(selectSnap);
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const wait = useAppSelector(selectPacerWait);

	const timeDisplayText = useAppSelector((state) => {
		const cursorPosition = selectCursorPosition(state);

		return formatCursorPosition(cursorPosition);
	});
	const beatDisplayText = useAppSelector((state) => {
		const cursorPositionInBeats = selectCursorPositionInBeats(state, sid);

		if (cursorPositionInBeats === null) return "--";

		// When the song is playing, this number will move incredibly quickly. It's a hot blurry mess.
		// Instead of trying to debounce rendering, let's just round the value aggressively
		const roundedCursorPosition = isPlaying ? roundToNearest(cursorPositionInBeats, 0.5) : cursorPositionInBeats;

		return formatCursorPositionInBeats(roundedCursorPosition);
	});

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

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes("editor", "navigation"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !isLoadingSong && hotkeys.getActiveScopes().includes("navigation"), [isLoadingSong, hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Toggle Playback", hotkey: "Space", action: () => dispatch(togglePlayback()), options: { requireReset: true } });

	useHotkey({ scopes, category, enabled, label: "Move Cursor Forwards", hotkey: "ArrowUp", action: () => handleScroll("forwards") });
	useHotkey({ scopes, category, enabled, label: "Move Cursor Backwards", hotkey: "ArrowDown", action: () => handleScroll("backwards") });

	useHotkey({ scopes, category, enabled, label: "Jump to Next Window", hotkey: "PageUp", action: () => dispatch(jumpForwards()) });
	useHotkey({ scopes, category, enabled, label: "Jump to Previous Window", hotkey: "PageDown", action: () => dispatch(jumpBackwards()) });
	useHotkey({ scopes, category, enabled, label: "Jump to Start", hotkey: "Home", action: () => dispatch(jumpToStart()) });
	useHotkey({ scopes, category, enabled, label: "Jump to End", hotkey: "End", action: () => dispatch(jumpToEnd()) });

	useHotkey({ scopes, category, enabled, label: "Quick Select", hotkey: "Mod+F", action: () => triggerQuickSelect() });
	useHotkey({ scopes, category, enabled, label: "Jump to Beat", hotkey: "Mod+G", action: () => triggerJumpToBeat() });
	useHotkey({ scopes, category, enabled, label: "Add Bookmark", hotkey: "Mod+B", action: () => triggerAddBookmark() });

	useHotkeys({
		commands: Array.from(range(1, 9)).map((num) => {
			return { scopes, category, label: `Snap to 1/${num}`, hotkey: `Mod+${num}`, action: () => dispatch(updateSnap(1 / num)), options: { preventDefault: true } };
		}),
	});

	const isModKeyPressed = useIsKeyPressed({ hotkey: "Mod" });

	// This handler handles mousewheel events.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards") => {
			if (!hotkeys.getActiveScopes().includes("navigation")) return;

			if (isModKeyPressed) {
				// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
				return dispatch((direction === "forwards" ? decrementSnap : incrementSnap)());
			}
			dispatch((direction === "forwards" ? moveForwards : moveBackwards)());
		},
		{ enabled: enabled, wait: wait },
	);

	useGlobalEventListener(
		"wheel",
		(event) => {
			event.preventDefault();
			return handleScroll(event.deltaY > 0 ? "backwards" : "forwards");
		},
		{ options: { passive: false } },
	);

	const getDenominator = useCallback((x: number) => 1 / x, []);

	const inputStyles = useMemo(() => ({ maxWidth: `calc(8.5ch + ${String(getDenominator(snapTo)).length}ch)` }), [snapTo, getDenominator]);

	return (
		<NavigationPanel.Section>
			<NavigationPanel.Column>
				<Stat label="Snap to">
					<Text>1</Text>
					<Text>/</Text>
					<Input unstyled style={inputStyles} type="number" min={1} max={32} step={"any"} value={getDenominator(snapTo)} onValueChange={(details) => dispatch(updateSnap(getDenominator(Number.isNaN(details.valueAsNumber) ? 1 : clamp(details.valueAsNumber, 1, 32))))} />
					<Text style={{ pointerEvents: "none", marginInlineStart: `-7.5ch` }}>Beats</Text>
				</Stat>
			</NavigationPanel.Column>
			<NavigationPanel.Column>
				<Button variant="ghost" size="icon" disabled={!enabled} unfocusOnPress onClick={() => dispatch(jumpToStart())}>
					<SkipBackIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={!enabled} unfocusOnPress onClick={() => dispatch(jumpBackwards())}>
					<RewindIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={!enabled} unfocusOnPress onClick={() => dispatch(togglePlayback())}>
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button variant="ghost" size="icon" disabled={!enabled} unfocusOnPress onClick={() => dispatch(jumpForwards())}>
					<FastForwardIcon />
				</Button>
				<Button variant="ghost" size="icon" disabled={!enabled} unfocusOnPress onClick={() => dispatch(jumpToEnd())}>
					<SkipForwardIcon />
				</Button>
			</NavigationPanel.Column>
			<NavigationPanel.Column>
				<Stat label="Time" align="end">
					{timeDisplayText}
				</Stat>
				<Stat label="Beat" align="end">
					{beatDisplayText}
				</Stat>
			</NavigationPanel.Column>
		</NavigationPanel.Section>
	);
}

export default EditorNavigationControls;
