import { createListCollection } from "@ark-ui/react/collection";
import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { type CSSProperties, useCallback, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { Field, ToggleGroup } from "$/components/ui/compositions";
import type { ColorResolverOptions } from "$/helpers/colors.helpers";
import { updateEventsEditorColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventsEditorColor } from "$/store/selectors";
import { EventColor } from "$/types";
import { styled } from "$:styled-system/jsx";
import { resolveColorForLightState } from "../track.helpers";

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

function EventColorControls() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedColor = useAppSelector(selectEventsEditorColor);

	const COLOR_LIST_COLLECTION = useMemo(() => createEventColorListCollection({ colorScheme }), [colorScheme]);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Pick Primary Color", hotkey: "1", action: () => dispatch(updateEventsEditorColor(EventColor.PRIMARY)) });
	useHotkey({ scopes, category, enabled, label: "Pick Secondary Color", hotkey: "2", action: () => dispatch(updateEventsEditorColor(EventColor.SECONDARY)) });
	useHotkey({ scopes, category, enabled, label: "Pick White Color", hotkey: "3", action: () => dispatch(updateEventsEditorColor(EventColor.WHITE)) });

	return (
		<Field cosmetic size="sm" label="Light Color">
			<ToggleGroup collection={COLOR_LIST_COLLECTION} unfocusOnPress value={[selectedColor]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorColor(details.value[0] as EventColor))} />
		</Field>
	);
}

const Box = styled("div", {
	base: {
		boxSize: "16px",
		borderRadius: "sm",
		backgroundLinear: "to-t",
		gradientFrom: "color-mix(in srgb, var(--color), black 15%)",
		gradientTo: "color-mix(in srgb, var(--color), white 15%)",
	},
});

export default EventColorControls;
