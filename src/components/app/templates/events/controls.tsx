import { createListCollection } from "@ark-ui/react/collection";
import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { LockIcon, RepeatIcon, SquareDashedIcon, SquarePlusIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { type ComponentProps, type CSSProperties, useCallback, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { EventEffectIcon } from "$/components/icons";
import { Button, Field, Toggle, ToggleGroup, Tooltip } from "$/components/ui/compositions";
import { ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import type { ColorResolverOptions } from "$/helpers/colors.helpers";
import {
	copySelection,
	cutSelection,
	cycleToNextTool,
	cycleToPrevTool,
	decrementEventsEditorZoomLevel,
	deselectAllEntities,
	incrementEventsEditorZoomLevel,
	nudgeSelection,
	pasteSelection,
	redoEvents,
	removeAllSelectedEvents,
	toggleSelectAllEntities,
	undoEvents,
	updateEventsEditorColor,
	updateEventsEditorEditMode,
	updateEventsEditorMirrorLock,
	updateEventsEditorTool,
	updateEventsEditorWindowLock,
} from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventsEditorColor, selectEventsEditorEditMode, selectEventsEditorMirrorLock, selectEventsEditorTool, selectEventsEditorWindowLock, selectEventsEditorZoomLevel } from "$/store/selectors";
import { EventColor, EventEditMode, EventTool } from "$/types";
import { HStack, styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { resolveColorForLightState } from "./track.helpers";

const EDIT_MODE_LIST_COLLECTION = createListCollection({
	items: Object.values(EventEditMode).map((value, index) => {
		const Icon = [SquarePlusIcon, SquareDashedIcon][index];
		return { value, label: <Icon size={16} /> };
	}),
});

function createEventColorListCollection({ colorScheme }: ColorResolverOptions) {
	return createListCollection({
		items: Object.values(EventColor).map((value) => {
			const color = resolveColorForLightState({ color: value, isBoosted: false }, { colorScheme });
			const boostColor = resolveColorForLightState({ color: value, isBoosted: true }, { colorScheme });
			if (!color || !boostColor) return null;
			return { value, label: <Box style={{ background: `linear-gradient(135deg, ${color}, ${boostColor})` } as CSSProperties} /> };
		}),
	});
}
function createEventEffectListCollection({ selectedColor, colorScheme }: ColorResolverOptions & { selectedColor: EventColor | null }) {
	return createListCollection({
		items: Object.values(EventTool).map((value) => {
			const color = resolveColorForLightState({ color: selectedColor, isBoosted: false }, { colorScheme });
			const boostColor = resolveColorForLightState({ color: selectedColor, isBoosted: true }, { colorScheme });
			if (!color || !boostColor) return null;
			return { value, label: <EventEffectIcon tool={value} color={color} boostColor={boostColor} /> };
		}),
	});
}

function EventGridControls({ ...rest }: ComponentProps<typeof Wrapper>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ strict: false });

	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColor = useAppSelector(selectEventsEditorColor);
	const isLockedToCurrentWindow = useAppSelector(selectEventsEditorWindowLock);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const zoomLevel = useAppSelector(selectEventsEditorZoomLevel);

	const COLOR_LIST_COLLECTION = useMemo(() => createEventColorListCollection({ colorScheme }), [colorScheme]);
	const EFFECT_LIST_COLLECTION = useMemo(() => createEventEffectListCollection({ colorScheme, selectedColor }), [colorScheme, selectedColor]);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Toggle Place Mode", hotkey: "A", action: () => dispatch(updateEventsEditorEditMode(EventEditMode.PLACE)) });
	useHotkey({ scopes, category, enabled, label: "Toggle Select Mode", hotkey: "S", action: () => dispatch(updateEventsEditorEditMode(EventEditMode.SELECT)) });

	useHotkey({ scopes, category, enabled, label: "Pick Primary Color", hotkey: "R", action: () => dispatch(updateEventsEditorColor(EventColor.PRIMARY)) });
	useHotkey({ scopes, category, enabled, label: "Pick Secondary Color", hotkey: "B", action: () => dispatch(updateEventsEditorColor(EventColor.SECONDARY)) });
	useHotkey({ scopes, category, enabled, label: "Pick White Color", hotkey: "W", action: () => dispatch(updateEventsEditorColor(EventColor.WHITE)) });

	useHotkey({ scopes, category, enabled, label: "Pick On Effect", hotkey: "1", action: () => dispatch(updateEventsEditorTool(EventTool.ON)) });
	useHotkey({ scopes, category, enabled, label: "Pick Off Effect", hotkey: "2", action: () => dispatch(updateEventsEditorTool(EventTool.OFF)) });
	useHotkey({ scopes, category, enabled, label: "Pick Flash Effect", hotkey: "3", action: () => dispatch(updateEventsEditorTool(EventTool.FLASH)) });
	useHotkey({ scopes, category, enabled, label: "Pick Fade Effect", hotkey: "4", action: () => dispatch(updateEventsEditorTool(EventTool.FADE)) });
	useHotkey({ scopes, category, enabled, label: "Pick Transition Effect", hotkey: "5", action: () => dispatch(updateEventsEditorTool(EventTool.TRANSITION)) });

	useHotkey({ scopes, category, label: "Cycle to Next Effect", hotkey: "Tab", action: () => dispatch(cycleToNextTool()) });
	useHotkey({ scopes, category, label: "Cycle to Previous Effect", hotkey: "Shift+Tab", action: () => dispatch(cycleToPrevTool()) });

	useHotkey({ scopes, category, label: "Toggle Window Lock", hotkey: "Z", action: () => dispatch(updateEventsEditorWindowLock()) });
	useHotkey({ scopes, category, label: "Toggle Mirror Lock", hotkey: "X", action: () => dispatch(updateEventsEditorMirrorLock()) });

	useHotkey({ scopes, category, label: "Decrement Zoom Level", hotkey: "-", action: () => dispatch(decrementEventsEditorZoomLevel()) });
	useHotkey({ scopes, category, label: "Increment Zoom Level", hotkey: "=", action: () => dispatch(incrementEventsEditorZoomLevel()) });

	useHotkey({ scopes, category, label: "Cut Selection", hotkey: "Mod+X", action: () => dispatch(cutSelection()) });
	useHotkey({ scopes, category, label: "Copy Selection", hotkey: "Mod+C", action: () => dispatch(copySelection()) });
	useHotkey({ scopes, category, label: "Paste Selection", hotkey: "Mod+V", action: () => dispatch(pasteSelection()) });

	useHotkey({ scopes, category, label: "Nudge Selection Forwards", hotkey: "Alt+ArrowUp", action: () => dispatch(nudgeSelection({ direction: "forwards" })) });
	useHotkey({ scopes, category, label: "Nudge Selection Backwards", hotkey: "Alt+ArrowDown", action: () => dispatch(nudgeSelection({ direction: "backwards" })) });

	useHotkey({ scopes, category, label: "Select All Objects", hotkey: "Mod+A", action: () => dispatch(toggleSelectAllEntities()) });
	useHotkey({ scopes, category, label: "Deselect All Objects", hotkey: "Escape", action: () => dispatch(deselectAllEntities()) });
	useHotkey({ scopes, category, label: "Delete Selection", hotkey: "Delete", action: () => dispatch(removeAllSelectedEvents()) });

	useHotkey({ scopes, category, label: "Undo History Step", hotkey: "Mod+Z", action: () => dispatch(undoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });
	useHotkey({ scopes, category, label: "Redo History Step", hotkey: "Mod+Shift+Z", action: () => dispatch(redoEvents({ shouldJump: hotkeys.getActiveScopes().includes("navigation") })) });

	return (
		<Wrapper {...rest}>
			<HStack gap={4} justify={"flex-start"}>
				<Field cosmetic size="sm" label="Edit Mode">
					<ToggleGroup collection={EDIT_MODE_LIST_COLLECTION} unfocusOnPress value={[selectedEditMode]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorEditMode(details.value[0] as EventEditMode))} />
				</Field>
				<Field cosmetic size="sm" label="Light Color">
					<ToggleGroup collection={COLOR_LIST_COLLECTION} unfocusOnPress value={[selectedColor]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorColor(details.value[0] as EventColor))} />
				</Field>
				<Field cosmetic size="sm" label="Light Effect">
					<ToggleGroup collection={EFFECT_LIST_COLLECTION} unfocusOnPress value={[selectedTool]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorTool(details.value[0] as EventTool))} />
				</Field>
				<Field cosmetic size="sm" label="Locks">
					<HStack gap={1}>
						<Tooltip render={() => "Loop playback within the current event window"}>
							<Toggle unfocusOnPress pressed={isLockedToCurrentWindow} onPressedChange={(pressed) => dispatch(updateEventsEditorWindowLock(pressed))}>
								<RepeatIcon size={16} />
							</Toggle>
						</Tooltip>
						<Tooltip render={() => "Clone event placements for symmetrical tracks"}>
							<Toggle unfocusOnPress pressed={areLasersLocked} onPressedChange={(pressed) => dispatch(updateEventsEditorMirrorLock(pressed))}>
								<LockIcon size={16} />
							</Toggle>
						</Tooltip>
					</HStack>
				</Field>
			</HStack>
			<HStack gap={4} justify={"flex-end"}>
				<Field cosmetic size="sm" label="Zoom" align="end">
					<HStack gap={1}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(decrementEventsEditorZoomLevel())} disabled={zoomLevel === ZOOM_LEVEL_MIN}>
							<ZoomOutIcon size={14} />
						</Button>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(incrementEventsEditorZoomLevel())} disabled={zoomLevel === ZOOM_LEVEL_MAX}>
							<ZoomInIcon size={14} />
						</Button>
					</HStack>
				</Field>
			</HStack>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: hstack.raw({
		padding: 2,
		minHeight: "80px",
		justify: "space-between",
		gap: 4,
		borderBlockWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(4px)",
		userSelect: "none",
		overflowX: "auto",
		_scrollbar: { display: "none" },
	}),
});

const Box = styled("div", {
	base: {
		boxSize: "16px",
		borderRadius: "sm",
		backgroundLinear: "to-t",
		gradientFrom: "color-mix(in srgb, var(--color), black 15%)",
		gradientTo: "color-mix(in srgb, var(--color), white 15%)",
	},
});

export default EventGridControls;
