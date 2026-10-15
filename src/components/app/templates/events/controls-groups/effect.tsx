import { createListCollection } from "@ark-ui/react/collection";
import { useHotkey, useHotkeyStore, usePressedKeys } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { EventEffectIcon } from "$/components/icons";
import { Field, ToggleGroup } from "$/components/ui/compositions";
import type { ColorResolverOptions } from "$/helpers/colors.helpers";
import { updateEventsEditorTool } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventsEditorColor, selectEventsEditorTool } from "$/store/selectors";
import { type EventColor, EventTool } from "$/types";
import { resolveColorForLightState } from "../track.helpers";

function createEventEffectListCollection({ selectedColor, colorScheme }: ColorResolverOptions & { selectedColor: EventColor | null }) {
	return createListCollection({
		items: [EventTool.OFF, EventTool.FADE, EventTool.TRANSITION, EventTool.FLASH, EventTool.ON].map((value) => {
			const color = resolveColorForLightState({ color: selectedColor, isBoosted: false }, { colorScheme });
			const boostColor = resolveColorForLightState({ color: selectedColor, isBoosted: true }, { colorScheme });
			if (!color || !boostColor) return null;
			return { value, label: <EventEffectIcon tool={value} color={color} boostColor={boostColor} /> };
		}),
	});
}

function EventEffectControls() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const selectedColor = useAppSelector(selectEventsEditorColor);

	const EFFECT_LIST_COLLECTION = useMemo(() => createEventEffectListCollection({ colorScheme, selectedColor }), [colorScheme, selectedColor]);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	const pressedKeys = usePressedKeys();

	useHotkey({
		scopes,
		category,
		enabled,
		label: "Pick Off Effect",
		hotkey: "Q",
		action: () => {
			if (pressedKeys.includes("W")) return dispatch(updateEventsEditorTool(EventTool.FADE));
			return dispatch(updateEventsEditorTool(EventTool.OFF));
		},
	});
	useHotkey({
		scopes,
		category,
		enabled,
		label: "Pick On Effect",
		hotkey: "E",
		action: () => {
			if (pressedKeys.includes("W")) return dispatch(updateEventsEditorTool(EventTool.FLASH));
			return dispatch(updateEventsEditorTool(EventTool.ON));
		},
	});
	useHotkey({
		scopes,
		category,
		enabled,
		label: "Pick Transition Effect",
		hotkey: "W",
		action: () => {
			if (pressedKeys.includes("Q")) return dispatch(updateEventsEditorTool(EventTool.FADE));
			if (pressedKeys.includes("E")) return dispatch(updateEventsEditorTool(EventTool.FLASH));
			return dispatch(updateEventsEditorTool(EventTool.TRANSITION));
		},
	});

	return (
		<Field cosmetic size="sm" label="Light Effect">
			<ToggleGroup collection={EFFECT_LIST_COLLECTION} unfocusOnPress value={[selectedTool]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorTool(details.value[0] as EventTool))} />
		</Field>
	);
}

export default EventEffectControls;
