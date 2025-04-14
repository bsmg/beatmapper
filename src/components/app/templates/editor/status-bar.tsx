import { Presence } from "@ark-ui/react/presence";
import { BellIcon, BellOffIcon, BoxIcon, CuboidIcon, EyeClosedIcon, EyeIcon, FastForwardIcon, GaugeIcon, GlobeIcon, Maximize2Icon, Minimize2Icon, RewindIcon, Volume2Icon, VolumeXIcon, ZapIcon, ZapOffIcon } from "lucide-react";

import { useViewFromLocation } from "$/components/app/hooks";
import { toggleNoteTick, togglePreviewLightingInEventsView, tweakEventBackgroundOpacity, tweakEventRowHeight, updateBeatDepth, updatePlaybackSpeed, updateVolume } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectEventBackgroundOpacity, selectEventEditorRowHeight, selectEventEditorTogglePreview, selectIsLoading, selectNoteDensity, selectPlayNoteTick, selectPlaybackRate, selectTotalColorNotes, selectTotalObstacles, selectVolume, selectedTotalBombNotes } from "$/store/selectors";
import { type SongId, View } from "$/types";
import { pluralize } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { StatusBar } from "$/components/app/layouts";

interface Props {
	sid: SongId;
}
function EditorStatusBar({ sid }: Props) {
	const dispatch = useAppDispatch();
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
	const noteDensity = useAppSelector((state) => selectNoteDensity(state, sid));

	const view = useViewFromLocation();

	return (
		<Wrapper onWheel={(ev) => ev.stopPropagation()}>
			<Presence asChild present={view === View.BEATMAP}>
				<StatusBar.Section>
					<StatusBar.Group>
						<StatusBar.Indicator label={pluralize(numOfBlocks, "block")} icon={BoxIcon}>
							{numOfBlocks}
						</StatusBar.Indicator>
						<StatusBar.Indicator label={pluralize(numOfMines, "mine")} icon={GlobeIcon}>
							{numOfMines}
						</StatusBar.Indicator>
						<StatusBar.Indicator label={pluralize(numOfObstacles, "obstacle")} icon={CuboidIcon}>
							{numOfObstacles}
						</StatusBar.Indicator>
					</StatusBar.Group>
					<StatusBar.Indicator label={"Notes per second"} icon={GaugeIcon}>
						{noteDensity.toFixed(2)}
					</StatusBar.Indicator>
					<StatusBar.RangeGroup disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={7} max={14} value={[beatDepth]} onValueChange={(details) => dispatch(updateBeatDepth({ beatDepth: details.value[0] }))} />
				</StatusBar.Section>
			</Presence>
			<Presence asChild present={view === View.LIGHTSHOW}>
				<StatusBar.Section>
					<StatusBar.ToggleGroup disabled={isLoading} checked={showLightingPreview} onIcon={ZapIcon} offIcon={ZapOffIcon} onCheckedChange={() => dispatch(togglePreviewLightingInEventsView())} />
					<StatusBar.RangeGroup disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={25} max={50} step={1} value={[rowHeight]} onValueChange={(details) => dispatch(tweakEventRowHeight({ newHeight: details.value[0] }))} />
					<StatusBar.RangeGroup disabled={isLoading} minIcon={EyeClosedIcon} maxIcon={EyeIcon} min={0.3} max={1} step={0.02} value={[backgroundOpacity]} onValueChange={(details) => dispatch(tweakEventBackgroundOpacity({ newOpacity: details.value[0] }))} />
				</StatusBar.Section>
			</Presence>
			<StatusBar.Section>
				<StatusBar.ToggleGroup disabled={isLoading} checked={playNoteTick} onIcon={BellIcon} offIcon={BellOffIcon} onCheckedChange={() => dispatch(toggleNoteTick())} />
				<StatusBar.RangeGroup marks={[1]} disabled={isLoading} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0.5} max={1.5} step={0.1} value={[playbackRate]} onValueChange={(details) => dispatch(updatePlaybackSpeed({ playbackRate: details.value[0] }))} />
				<StatusBar.RangeGroup disabled={isLoading} minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={[volume]} onValueChange={(details) => dispatch(updateVolume({ volume: details.value[0] }))} />
			</StatusBar.Section>
		</Wrapper>
	);
}

const Wrapper = styled(StatusBar.Root, {
	base: {
		position: "absolute",
		bottom: 0,
		width: "100%",
	},
});

export default EditorStatusBar;
