import { useListCollection } from "@ark-ui/react/collection";
import { formatHotkey, useHotkey, useHotkeys, useIsKeyPressed } from "@ark-ui/react/hotkeys";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useParams } from "@tanstack/react-router";
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";
import { useMemo } from "react";

import { createAddBookmarkPrompt, createJumpToBeatPrompt, createQuickSelectPrompt } from "$/components/app/constants";
import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { NavigationPanel } from "$/components/app/layouts";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Button, Select, Stat, usePrompt } from "$/components/ui/compositions";
import { SNAPPING_INCREMENTS } from "$/constants";
import { formatCursorPosition, formatCursorPositionInBeats } from "$/helpers/audio.helpers";
import { resolveColorForBookmark } from "$/helpers/bookmarks.helpers";
import { calculateQuickSelectRange } from "$/helpers/editor.helpers";
import { addBookmark, decrementSnap, incrementSnap, jumpBackwards, jumpForwards, jumpToBeat, jumpToEnd, jumpToStart, moveBackwards, moveForwards, selectAllEntitiesInRange, togglePlayback, updateSnap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCursorPosition, selectCursorPositionInBeats, selectLoading, selectPacerWait, selectPlaying, selectSnap } from "$/store/selectors";
import { range, roundToNearest } from "$/utils";

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

	const { collection: SNAPPING_INCREMENT_LIST_COLLECTION } = useListCollection({
		initialItems: SNAPPING_INCREMENTS.map((x) => ({ ...x, value: x.value.toString() })),
		itemToValue: (item) => item.value,
		itemToString: (item) => (item.shortcutKey ? `${item.label} (${formatHotkey(`Mod+${item.shortcutKey}`, { separator: "+" })})` : item.label),
	});

	const scopes = useMemo(() => getHotkeyScopes("editor", "navigation"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);
	const enabled = useMemo(() => !isLoadingSong, [isLoadingSong]);

	useHotkeys({
		commands: Array.from(range(1, 9)).map((num) => {
			const newSnappingIncrement = SNAPPING_INCREMENTS.find((increment) => increment.shortcutKey === num);
			if (!newSnappingIncrement) throw new Error(`Invalid value supplied for snap interval: ${num}`);
			return {
				scopes,
				category,
				label: `Snap to ${newSnappingIncrement.label}`,
				hotkey: `Mod+${num}`,
				action: () => {
					return dispatch(updateSnap(newSnappingIncrement.value));
				},
				options: {
					preventDefault: true,
				},
			};
		}),
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

	useHotkey({ scopes, category, enabled, label: "Toggle Playback", hotkey: "Space", action: () => dispatch(togglePlayback()), options: { requireReset: true } });

	useHotkey({ scopes, category, enabled, label: "Move Cursor Forwards", hotkey: "ArrowUp", action: () => handleScroll("forwards") });
	useHotkey({ scopes, category, enabled, label: "Move Cursor Backwards", hotkey: "ArrowDown", action: () => handleScroll("backwards") });

	useHotkey({ scopes, category, enabled, label: "Jump to Next Window", hotkey: "PageUp", action: () => dispatch(jumpForwards()) });
	useHotkey({ scopes, category, enabled, label: "Jump to Previous Window", hotkey: "PageDown", action: () => dispatch(jumpBackwards()) });
	useHotkey({ scopes, category, enabled, label: "Jump to Start", hotkey: "Home", action: () => dispatch(jumpToStart()) });
	useHotkey({ scopes, category, enabled, label: "Jump to End", hotkey: "End", action: () => dispatch(jumpToEnd()) });

	useHotkey({ scopes, category, enabled, label: "Quick Select", hotkey: "Q", action: () => triggerQuickSelect() });
	useHotkey({ scopes, category, enabled, label: "Jump to Beat", hotkey: "J", action: () => triggerJumpToBeat() });
	useHotkey({ scopes, category, enabled, label: "Add Bookmark", hotkey: "Mod+B", action: () => triggerAddBookmark() });

	const isModKeyPressed = useIsKeyPressed({ hotkey: "Mod" });

	// This handler handles mousewheel events.
	const handleScroll = useThrottledCallback(
		(direction: "forwards" | "backwards") => {
			// If the user is holding Cmd/ctrl, we should scroll through snapping increments instead of the song.
			if (isModKeyPressed) {
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

	return (
		<NavigationPanel.Section>
			<NavigationPanel.Column>
				<Select label="Snap to" unfocusOnPress collection={SNAPPING_INCREMENT_LIST_COLLECTION} value={[snapTo.toString()]} onValueChange={(ev) => dispatch(updateSnap(Number.parseFloat(ev.value[0])))} />
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
				<Stat label="Time">{timeDisplayText}</Stat>
				<Stat label="Beat">{beatDisplayText}</Stat>
			</NavigationPanel.Column>
		</NavigationPanel.Section>
	);
}

export default EditorNavigationControls;
