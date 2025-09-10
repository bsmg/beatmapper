import { Presence } from "@ark-ui/react/presence";
import { BellIcon, BellOffIcon, BoxIcon, CuboidIcon, EyeClosedIcon, EyeIcon, FastForwardIcon, GaugeIcon, GlobeIcon, Maximize2Icon, Minimize2Icon, RewindIcon, Volume2Icon, VolumeXIcon, ZapIcon, ZapOffIcon } from "lucide-react";

import { useViewFromLocation } from "$/components/app/hooks";
import { StatusBar } from "$/components/app/layouts";
import { updateBeatDepth, updateEventsEditorPreview, updateEventsEditorTrackHeight, updateEventsEditorTrackOpacity, updatePlaybackRate, updateSongVolume, updateTickVolume } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectEventsEditorPreview, selectEventsEditorTrackHeight, selectEventsEditorTrackOpacity, selectedTotalBombNotes, selectLoading, selectNoteDensity, selectPlaybackRate, selectSongVolume, selectTickVolume, selectTotalColorNotes, selectTotalObstacles } from "$/store/selectors";
import { View } from "$/types";
import { pluralize } from "$/utils";
import { styled } from "$:styled-system/jsx";

function EditorStatusBar() {
	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const playbackRate = useAppSelector(selectPlaybackRate);
	const beatDepth = useAppSelector(selectBeatDepth);
	const songVolume = useAppSelector(selectSongVolume);
	const tickVolume = useAppSelector(selectTickVolume);
	const numOfBlocks = useAppSelector(selectTotalColorNotes);
	const numOfMines = useAppSelector(selectedTotalBombNotes);
	const numOfObstacles = useAppSelector(selectTotalObstacles);
	const showLightingPreview = useAppSelector(selectEventsEditorPreview);
	const rowHeight = useAppSelector(selectEventsEditorTrackHeight);
	const backgroundOpacity = useAppSelector(selectEventsEditorTrackOpacity);
	const noteDensity = useAppSelector(selectNoteDensity);

	const view = useViewFromLocation();

	return (
		<Wrapper onWheel={(ev) => ev.stopPropagation()}>
			<Presence asChild present={view === View.BEATMAP}>
				<StatusBar.Section>
					<StatusBar.Group>
						<StatusBar.Indicator label={`${numOfBlocks} ${pluralize(numOfBlocks, "note")}`} icon={BoxIcon}>
							{numOfBlocks}
						</StatusBar.Indicator>
						<StatusBar.Indicator label={`${numOfMines} ${pluralize(numOfMines, "bomb")}`} icon={GlobeIcon}>
							{numOfMines}
						</StatusBar.Indicator>
						<StatusBar.Indicator label={`${numOfObstacles} ${pluralize(numOfObstacles, "obstacle")}`} icon={CuboidIcon}>
							{numOfObstacles}
						</StatusBar.Indicator>
					</StatusBar.Group>
					<StatusBar.Indicator label={"Notes per second"} icon={GaugeIcon}>
						{noteDensity.toFixed(2)}
					</StatusBar.Indicator>
					<StatusBar.Range label={"Beat depth"} disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={5} max={25} value={[beatDepth]} onValueChange={(details) => dispatch(updateBeatDepth({ value: details.value[0] }))} />
					<StatusBar.Range label={"Note tick volume"} disabled={isLoading} minIcon={BellOffIcon} maxIcon={BellIcon} min={0} max={1} step={0.1} value={[tickVolume]} onValueChange={(details) => dispatch(updateTickVolume({ value: details.value[0] }))} />
				</StatusBar.Section>
			</Presence>
			<Presence asChild present={view === View.LIGHTSHOW}>
				<StatusBar.Section>
					<StatusBar.Toggle label={"Show environment"} disabled={isLoading} checked={showLightingPreview} onIcon={ZapIcon} offIcon={ZapOffIcon} onCheckedChange={() => dispatch(updateEventsEditorPreview())} />
					<StatusBar.Range label={"Track height"} disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={25} max={50} step={1} value={[rowHeight]} onValueChange={(details) => dispatch(updateEventsEditorTrackHeight({ newHeight: details.value[0] }))} />
					<StatusBar.Range label={"Track opacity"} disabled={isLoading} minIcon={EyeClosedIcon} maxIcon={EyeIcon} min={0.3} max={1} step={0.02} value={[backgroundOpacity]} onValueChange={(details) => dispatch(updateEventsEditorTrackOpacity({ newOpacity: details.value[0] }))} />
				</StatusBar.Section>
			</Presence>
			<Presence asChild present={view === View.PREVIEW}>
				<StatusBar.Section>
					<StatusBar.Range label={"Note tick volume"} disabled={isLoading} minIcon={BellOffIcon} maxIcon={BellIcon} min={0} max={1} step={0.1} value={[tickVolume]} onValueChange={(details) => dispatch(updateTickVolume({ value: details.value[0] }))} />
				</StatusBar.Section>
			</Presence>
			<StatusBar.Section>
				<StatusBar.Range label={"Playback rate"} marks={[1]} disabled={isLoading} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0} max={2} step={0.1} value={[playbackRate]} onValueChange={(details) => dispatch(updatePlaybackRate({ value: details.value[0] }))} />
				<StatusBar.Range label={"Song volume"} disabled={isLoading} minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={[songVolume]} onValueChange={(details) => dispatch(updateSongVolume({ value: details.value[0] }))} />
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
