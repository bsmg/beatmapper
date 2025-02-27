// TODO: This status bar is reused across two views, but the views don't need the same info :/ I should create a shared "root" component with slots for the stuff that is variant.

import { useLocation } from "@tanstack/react-router";
import { BellIcon, BellOffIcon, BoxIcon, CuboidIcon, EyeClosedIcon, EyeIcon, FastForwardIcon, GlobeIcon, Maximize2Icon, Minimize2Icon, RewindIcon, Volume2Icon, VolumeXIcon, ZapIcon, ZapOffIcon } from "lucide-react";
import { type CSSProperties, Fragment, type ReactNode } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { toggleNoteTick, togglePreviewLightingInEventsView, tweakEventBackgroundOpacity, tweakEventRowHeight, updateBeatDepth, updatePlaybackSpeed, updateVolume } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectEventBackgroundOpacity, selectEventEditorRowHeight, selectEventEditorTogglePreview, selectIsLoading, selectPlayNoteTick, selectPlaybackRate, selectTotalColorNotes, selectTotalObstacles, selectVolume, selectedTotalBombNotes } from "$/store/selectors";
import { View } from "$/types";
import { pluralize } from "$/utils";

import Spacer from "../Spacer";
import CountIndicator from "./CountIndicator";
import NoteDensityIndicator from "./NoteDensityIndicator";
import SliderGroup from "./SliderGroup";
import Toggle from "./Toggle";

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

interface Props {
	height: CSSProperties["height"];
}

const EditorStatusBar = ({ height }: Props) => {
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

	let leftContent: ReactNode;
	let rightContent: ReactNode;

	if (view === View.BEATMAP) {
		leftContent = (
			<Fragment>
				<CountIndicator num={numOfBlocks} label={pluralize(numOfBlocks, "block")} icon={BoxIcon} />
				<Spacer size={token.var("spacing.2")} />
				<CountIndicator num={numOfMines} label={pluralize(numOfMines, "mine")} icon={GlobeIcon} />
				<Spacer size={token.var("spacing.2")} />
				<CountIndicator num={numOfObstacles} label={pluralize(numOfObstacles, "obstacle")} icon={CuboidIcon} />
				<Spacer size={token.var("spacing.6")} />
				<NoteDensityIndicator />
			</Fragment>
		);

		rightContent = (
			<Fragment>
				<Toggle size={8} value={playNoteTick} onIcon={BellIcon} offIcon={BellOffIcon} onChange={() => dispatch(toggleNoteTick())} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup disabled={isLoading} width={token.var("spacing.7")} height={height} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={7} max={14} value={beatDepth} onChange={(value) => dispatch(updateBeatDepth({ beatDepth: Number(value) }))} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup includeMidpointTick disabled={isLoading} width={token.var("spacing.7")} height={height} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0.5} max={1.5} step={0.1} value={playbackRate} onChange={(value) => dispatch(updatePlaybackSpeed({ playbackRate: Number(value) }))} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup width={token.var("spacing.7")} height={height} minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={volume} onChange={(value) => dispatch(updateVolume({ volume: Number(value) }))} />
			</Fragment>
		);
	} else if (view === View.LIGHTSHOW) {
		leftContent = (
			<Fragment>
				<Toggle size={8} value={showLightingPreview} onIcon={ZapIcon} offIcon={ZapOffIcon} onChange={() => dispatch(togglePreviewLightingInEventsView())} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup width={token.var("spacing.5")} height={height} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={25} max={50} step={1} value={rowHeight} onChange={(value) => dispatch(tweakEventRowHeight({ newHeight: Number(value) }))} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup disabled={isLoading} width={token.var("spacing.5")} height={height} minIcon={EyeClosedIcon} maxIcon={EyeIcon} min={0.3} max={1} step={0.02} value={backgroundOpacity} onChange={(value) => dispatch(tweakEventBackgroundOpacity({ newOpacity: Number(value) }))} />
			</Fragment>
		);
		rightContent = (
			<Fragment>
				<Toggle size={8} value={playNoteTick} onIcon={BellIcon} offIcon={BellOffIcon} onChange={() => dispatch(toggleNoteTick())} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup includeMidpointTick disabled={isLoading} width={token.var("spacing.7")} height={height} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0.5} max={1.5} step={0.1} value={playbackRate} onChange={(value) => dispatch(updatePlaybackSpeed({ playbackRate: Number(value) }))} />
				<Spacer size={token.var("spacing.6")} />
				<SliderGroup width={token.var("spacing.7")} height={height} minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={volume} onChange={(value) => dispatch(updateVolume({ volume: Number(value) }))} />
			</Fragment>
		);
	}

	return (
		<Wrapper style={{ height, lineHeight: height }}>
			<Left>{leftContent}</Left>
			<Right>{rightContent}</Right>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${token.var("colors.slate.900")};
  font-size: 12px;
  padding: 0 ${token.var("spacing.2")};
  color: ${token.var("colors.slate.300")};

  @media (max-width: 850px) {
    justify-content: center;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 850px) {
    display: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

export default EditorStatusBar;
