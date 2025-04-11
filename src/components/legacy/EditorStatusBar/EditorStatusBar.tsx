import { Presence } from "@ark-ui/react/presence";
import { useLocation } from "@tanstack/react-router";
import { BellIcon, BellOffIcon, BoxIcon, CuboidIcon, EyeClosedIcon, EyeIcon, FastForwardIcon, GlobeIcon, Maximize2Icon, Minimize2Icon, RewindIcon, Volume2Icon, VolumeXIcon, ZapIcon, ZapOffIcon } from "lucide-react";

import { toggleNoteTick, togglePreviewLightingInEventsView, tweakEventBackgroundOpacity, tweakEventRowHeight, updateBeatDepth, updatePlaybackSpeed, updateVolume } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectEventBackgroundOpacity, selectEventEditorRowHeight, selectEventEditorTogglePreview, selectIsLoading, selectPlayNoteTick, selectPlaybackRate, selectTotalColorNotes, selectTotalObstacles, selectVolume, selectedTotalBombNotes } from "$/store/selectors";
import { View } from "$/types";
import { pluralize } from "$/utils";

import { HStack, styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import CountIndicator from "./CountIndicator";
import NoteDensityIndicator from "./NoteDensityIndicator";
import SliderGroup from "./SliderGroup";
import ToggleGroup from "./Toggle";

// TODO: move this to a dedicated hook
function getViewFromLocation() {
	const location = useLocation();
	if (location.pathname.match(/\/notes$/)) {
		return View.BEATMAP;
	}
	if (location.pathname.match(/\/events$/)) {
		return View.LIGHTSHOW;
	}
	return View.PREVIEW;
}

const EditorStatusBar = () => {
	const isLoading = useAppSelector(selectIsLoading);
	const playbackRate = useAppSelector(selectPlaybackRate);
	const beatDepth = useAppSelector(selectBeatDepth);
	const volume = useAppSelector(selectVolume);
	const playNoteTick = useAppSelector(selectPlayNoteTick);
	const numOfBlocks = useAppSelector(selectTotalColorNotes);
	const numOfMines = useAppSelector(selectedTotalBombNotes);
	const numOfObstacles = useAppSelector(selectTotalObstacles);
	const showLightingPreview = useAppSelector(selectEventEditorTogglePreview);
	const rowHeight = useAppSelector(selectEventEditorRowHeight);
	const backgroundOpacity = useAppSelector(selectEventBackgroundOpacity);
	const dispatch = useAppDispatch();

	const view = getViewFromLocation();

	return (
		<Wrapper>
			<Presence asChild present={view === View.BEATMAP}>
				<HStack gap={6} justify={"flex-start"}>
					<HStack gap={2}>
						<CountIndicator num={numOfBlocks} label={pluralize(numOfBlocks, "block")} icon={BoxIcon} />
						<CountIndicator num={numOfMines} label={pluralize(numOfMines, "mine")} icon={GlobeIcon} />
						<CountIndicator num={numOfObstacles} label={pluralize(numOfObstacles, "obstacle")} icon={CuboidIcon} />
					</HStack>
					<NoteDensityIndicator />
					<SliderGroup disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={7} max={14} value={[beatDepth]} onValueChange={(details) => dispatch(updateBeatDepth({ beatDepth: details.value[0] }))} />
				</HStack>
			</Presence>
			<Presence asChild present={view === View.LIGHTSHOW}>
				<HStack gap={6} justify={"flex-start"}>
					<ToggleGroup checked={showLightingPreview} onIcon={ZapIcon} offIcon={ZapOffIcon} onCheckedChange={() => dispatch(togglePreviewLightingInEventsView())} />
					<SliderGroup minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={25} max={50} step={1} value={[rowHeight]} onValueChange={(details) => dispatch(tweakEventRowHeight({ newHeight: details.value[0] }))} />
					<SliderGroup disabled={isLoading} minIcon={EyeClosedIcon} maxIcon={EyeIcon} min={0.3} max={1} step={0.02} value={[backgroundOpacity]} onValueChange={(details) => dispatch(tweakEventBackgroundOpacity({ newOpacity: details.value[0] }))} />
				</HStack>
			</Presence>
			<HStack gap={6} justify={"flex-end"}>
				<ToggleGroup checked={playNoteTick} onIcon={BellIcon} offIcon={BellOffIcon} onCheckedChange={() => dispatch(toggleNoteTick())} />
				<SliderGroup marks={[1]} disabled={isLoading} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0.5} max={1.5} step={0.1} value={[playbackRate]} onValueChange={(details) => dispatch(updatePlaybackSpeed({ playbackRate: details.value[0] }))} />
				<SliderGroup minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={[volume]} onValueChange={(details) => dispatch(updateVolume({ volume: details.value[0] }))} />
			</HStack>
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: hstack.raw({
		height: "statusBar",
		justify: { base: "center", md: "space-between" },
		gap: 6,
		paddingInline: 2,
		fontSize: "12px",
		backgroundColor: "bg.muted",
		borderTopWidth: "sm",
		borderColor: "border.muted",
		color: "fg.muted",
	}),
});

export default EditorStatusBar;
