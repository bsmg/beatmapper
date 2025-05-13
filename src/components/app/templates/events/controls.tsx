import { createListCollection } from "@ark-ui/react/collection";
import { LockIcon, RepeatIcon, SquareDashedIcon, SquarePlusIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { type CSSProperties, type ComponentProps, useMemo } from "react";

import { ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { selectEventColor, selectEventEditMode, selectTool, toggleEventWindowLock, toggleLaserLock, zoomIn, zoomOut } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectEventEditorColor, selectEventEditorEditMode, selectEventEditorToggleLoop, selectEventEditorToggleMirror, selectEventEditorTool, selectEventEditorZoomLevel } from "$/store/selectors";
import { type App, EventColor, EventEditMode, EventTool, type SongId, View } from "$/types";

import { HStack, styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { EventEffectIcon } from "$/components/icons";
import { Button, Field, Toggle, ToggleGroup, Tooltip } from "$/components/ui/compositions";

const EDIT_MODE_LIST_COLLECTION = createListCollection({
	items: Object.values(EventEditMode).map((value, index) => {
		const Icon = [SquarePlusIcon, SquareDashedIcon][index];
		return { value, label: <Icon size={16} /> };
	}),
});

interface EventListCollection {
	environment?: App.Song["environment"];
	customColors?: App.ModSettings["customColors"];
	selectedColor?: EventColor;
}
function createEventColorListCollection({ environment, customColors }: EventListCollection) {
	return createListCollection({
		items: Object.values(EventColor).map((value) => {
			return { value, label: <Box style={{ "--color": resolveColorForItem(value, { environment, customColors }) } as CSSProperties} /> };
		}),
	});
}
function createEventEffectListCollection({ selectedColor, environment, customColors }: EventListCollection) {
	return createListCollection({
		items: Object.values(EventTool).map((value) => {
			return { value, label: <EventEffectIcon tool={value} color={resolveColorForItem(selectedColor, { environment, customColors })} /> };
		}),
	});
}

interface Props extends ComponentProps<typeof Wrapper> {
	sid: SongId;
}
function EventGridControls({ sid, ...rest }: Props) {
	const dispatch = useAppDispatch();
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedTool = useAppSelector(selectEventEditorTool);
	const selectedColor = useAppSelector(selectEventEditorColor);
	const isLockedToCurrentWindow = useAppSelector(selectEventEditorToggleLoop);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);
	const zoomLevel = useAppSelector(selectEventEditorZoomLevel);

	const COLOR_LIST_COLLECTION = useMemo(() => createEventColorListCollection({ customColors }), [customColors]);
	const EFFECT_LIST_COLLECTION = useMemo(() => createEventEffectListCollection({ customColors, selectedColor }), [customColors, selectedColor]);

	return (
		<Wrapper {...rest}>
			<HStack gap={4} justify={"flex-start"}>
				<Field cosmetic size="sm" label="Edit Mode">
					<ToggleGroup collection={EDIT_MODE_LIST_COLLECTION} value={[selectedEditMode]} onValueChange={(details) => details.value.length > 0 && dispatch(selectEventEditMode({ editMode: details.value[0] as EventEditMode }))} />
				</Field>
				<Field cosmetic size="sm" label="Color">
					<ToggleGroup collection={COLOR_LIST_COLLECTION} value={[selectedColor]} onValueChange={(details) => details.value.length > 0 && dispatch(selectEventColor({ color: details.value[0] as EventColor }))} />
				</Field>
				<Field cosmetic size="sm" label="Effect">
					<ToggleGroup collection={EFFECT_LIST_COLLECTION} value={[selectedTool]} onValueChange={(details) => details.value.length > 0 && dispatch(selectTool({ view: View.LIGHTSHOW, tool: details.value[0] as EventTool }))} />
				</Field>
				<Field cosmetic size="sm" label="Locks">
					<HStack gap={1}>
						<Tooltip render={() => "Loop playback within the current event window (L)"}>
							<Toggle pressed={isLockedToCurrentWindow} onPressedChange={() => dispatch(toggleEventWindowLock())}>
								<RepeatIcon size={16} />
							</Toggle>
						</Tooltip>
						<Tooltip render={() => "Pair side lasers for symmetrical left/right events"}>
							<Toggle pressed={areLasersLocked} onPressedChange={() => dispatch(toggleLaserLock())}>
								<LockIcon size={16} />
							</Toggle>
						</Tooltip>
					</HStack>
				</Field>
			</HStack>
			<HStack gap={4} justify={"flex-end"}>
				<Field cosmetic size="sm" label="Zoom" align="end">
					<HStack gap={1}>
						<Button variant="subtle" size="sm" onClick={() => dispatch(zoomOut())} disabled={zoomLevel === ZOOM_LEVEL_MIN}>
							<ZoomOutIcon size={14} />
						</Button>
						<Button variant="subtle" size="sm" onClick={() => dispatch(zoomIn())} disabled={zoomLevel === ZOOM_LEVEL_MAX}>
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
		background: "linear-gradient(0deg, color-mix(in srgb, var(--color), black 15%), color-mix(in srgb, var(--color), white 15%))",
	},
});

export default EventGridControls;
