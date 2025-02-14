// TODO: This status bar is reused across two views, but the views don't need the same info :/ I should create a shared "root" component with slots for the stuff that is variant.

import { Fragment, type ReactNode } from "react";
import { alignJustify as rowHeightMinIcon } from "react-icons-kit/feather/alignJustify";
import { bell as tickOnIcon } from "react-icons-kit/feather/bell";
import { bellOff as tickOffIcon } from "react-icons-kit/feather/bellOff";
import { box } from "react-icons-kit/feather/box";
import { codepen } from "react-icons-kit/feather/codepen";
import { eye as backgroundOpacityMaxIcon } from "react-icons-kit/feather/eye";
import { eyeOff as backgroundOpacityMinIcon } from "react-icons-kit/feather/eyeOff";
import { fastForward as playbackSpeedMaxIcon } from "react-icons-kit/feather/fastForward";
import { globe } from "react-icons-kit/feather/globe";
import { maximize2 as distanceFarIcon } from "react-icons-kit/feather/maximize2";
import { menu as rowHeightMaxIcon } from "react-icons-kit/feather/menu";
import { minimize2 as distanceCloseIcon } from "react-icons-kit/feather/minimize2";
import { music as playbackSpeedMinIcon } from "react-icons-kit/feather/music";
import { volume2 as volumeMaxIcon } from "react-icons-kit/feather/volume2";
import { volumeX as volumeMinIcon } from "react-icons-kit/feather/volumeX";
import { zap as showLightsIcon } from "react-icons-kit/feather/zap";
import { zapOff as hideLightsIcon } from "react-icons-kit/feather/zapOff";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";
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
	height: number;
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
				<CountIndicator num={numOfBlocks} label={pluralize(numOfBlocks, "block")} icon={box} />
				<Spacer size={UNIT * 2} />
				<CountIndicator num={numOfMines} label={pluralize(numOfMines, "mine")} icon={globe} />
				<Spacer size={UNIT * 2} />
				<CountIndicator num={numOfObstacles} label={pluralize(numOfObstacles, "obstacle")} icon={codepen} />
				<Spacer size={UNIT * 6} />
				<NoteDensityIndicator />
			</Fragment>
		);

		rightContent = (
			<Fragment>
				<Toggle size={8} value={playNoteTick} onIcon={tickOnIcon} offIcon={tickOffIcon} onChange={() => dispatch(toggleNoteTick())} />
				<Spacer size={UNIT * 6} />
				<SliderGroup disabled={isLoading} width={UNIT * 7} height={height} minIcon={distanceCloseIcon} maxIcon={distanceFarIcon} min={7} max={14} value={beatDepth} onChange={(value) => dispatch(updateBeatDepth({ beatDepth: Number(value) }))} />
				<Spacer size={UNIT * 6} />
				<SliderGroup includeMidpointTick disabled={isLoading} width={UNIT * 7} height={height} minIcon={playbackSpeedMinIcon} maxIcon={playbackSpeedMaxIcon} min={0.5} max={1.5} step={0.1} value={playbackRate} onChange={(value) => dispatch(updatePlaybackSpeed({ playbackRate: Number(value) }))} />
				<Spacer size={UNIT * 6} />
				<SliderGroup width={UNIT * 7} height={height} minIcon={volumeMinIcon} maxIcon={volumeMaxIcon} min={0} max={1} value={volume} onChange={(value) => dispatch(updateVolume({ volume: Number(value) }))} />
			</Fragment>
		);
	} else if (view === View.LIGHTSHOW) {
		leftContent = (
			<Fragment>
				<Toggle size={8} value={showLightingPreview} onIcon={showLightsIcon} offIcon={hideLightsIcon} onChange={() => dispatch(togglePreviewLightingInEventsView())} />
				<Spacer size={UNIT * 6} />
				<SliderGroup width={UNIT * 5} height={height} minIcon={rowHeightMinIcon} maxIcon={rowHeightMaxIcon} min={25} max={50} step={1} value={rowHeight} onChange={(value) => dispatch(tweakEventRowHeight({ newHeight: Number(value) }))} />
				<Spacer size={UNIT * 6} />
				<SliderGroup disabled={isLoading} width={UNIT * 5} height={height} minIcon={backgroundOpacityMinIcon} maxIcon={backgroundOpacityMaxIcon} min={0.3} max={1} step={0.02} value={backgroundOpacity} onChange={(value) => dispatch(tweakEventBackgroundOpacity({ newOpacity: Number(value) }))} />
			</Fragment>
		);
		rightContent = (
			<Fragment>
				<Toggle size={8} value={playNoteTick} onIcon={tickOnIcon} offIcon={tickOffIcon} onChange={() => dispatch(toggleNoteTick())} />
				<Spacer size={UNIT * 6} />
				<SliderGroup includeMidpointTick disabled={isLoading} width={UNIT * 7} height={height} minIcon={playbackSpeedMinIcon} maxIcon={playbackSpeedMaxIcon} min={0.5} max={1.5} step={0.1} value={playbackRate} onChange={(value) => dispatch(updatePlaybackSpeed({ playbackRate: Number(value) }))} />
				<Spacer size={UNIT * 6} />
				<SliderGroup width={UNIT * 7} height={height} minIcon={volumeMinIcon} maxIcon={volumeMaxIcon} min={0} max={1} value={volume} onChange={(value) => dispatch(updateVolume({ volume: Number(value) }))} />
			</Fragment>
		);
	}

	return (
		<Wrapper style={{ height, lineHeight: `${height}px` }}>
			<Left>{leftContent}</Left>
			<Right>{rightContent}</Right>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${COLORS.blueGray[900]};
  font-size: 12px;
  padding: 0 ${UNIT * 2}px;
  color: ${COLORS.blueGray[300]};

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
