import { createListCollection } from "@ark-ui/react/collection";
import { useParams } from "@tanstack/react-router";
import { LockIcon, RepeatIcon, SquareDashedIcon, SquarePlusIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { type ComponentProps, type CSSProperties, useMemo } from "react";

import { EventEffectIcon } from "$/components/icons";
import { Button, Field, Toggle, ToggleGroup, Tooltip } from "$/components/ui/compositions";
import { ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import type { ColorResolverOptions } from "$/helpers/colors.helpers";
import { decrementEventsEditorZoom, incrementEventsEditorZoom, updateEventsEditorColor, updateEventsEditorEditMode, updateEventsEditorMirrorLock, updateEventsEditorTool, updateEventsEditorWindowLock } from "$/store/actions";
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

	return (
		<Wrapper {...rest}>
			<HStack gap={4} justify={"flex-start"}>
				<Field cosmetic size="sm" label="Edit Mode">
					<ToggleGroup collection={EDIT_MODE_LIST_COLLECTION} unfocusOnPress value={[selectedEditMode]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorEditMode({ editMode: details.value[0] as EventEditMode }))} />
				</Field>
				<Field cosmetic size="sm" label="Light Color">
					<ToggleGroup collection={COLOR_LIST_COLLECTION} unfocusOnPress value={[selectedColor]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorColor({ color: details.value[0] as EventColor }))} />
				</Field>
				<Field cosmetic size="sm" label="Light Effect">
					<ToggleGroup collection={EFFECT_LIST_COLLECTION} unfocusOnPress value={[selectedTool]} onValueChange={(details) => details.value.length > 0 && dispatch(updateEventsEditorTool({ tool: details.value[0] as EventTool }))} />
				</Field>
				<Field cosmetic size="sm" label="Locks">
					<HStack gap={1}>
						<Tooltip render={() => "Loop playback within the current event window"}>
							<Toggle unfocusOnPress pressed={isLockedToCurrentWindow} onPressedChange={() => dispatch(updateEventsEditorWindowLock())}>
								<RepeatIcon size={16} />
							</Toggle>
						</Tooltip>
						<Tooltip render={() => "Clone event placements for symmetrical tracks"}>
							<Toggle unfocusOnPress pressed={areLasersLocked} onPressedChange={() => dispatch(updateEventsEditorMirrorLock())}>
								<LockIcon size={16} />
							</Toggle>
						</Tooltip>
					</HStack>
				</Field>
			</HStack>
			<HStack gap={4} justify={"flex-end"}>
				<Field cosmetic size="sm" label="Zoom" align="end">
					<HStack gap={1}>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(decrementEventsEditorZoom())} disabled={zoomLevel === ZOOM_LEVEL_MIN}>
							<ZoomOutIcon size={14} />
						</Button>
						<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(incrementEventsEditorZoom())} disabled={zoomLevel === ZOOM_LEVEL_MAX}>
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
