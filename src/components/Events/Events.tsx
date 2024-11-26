import { Fragment } from "react";
import styled from "styled-components";

import { SIDEBAR_WIDTH } from "$/constants";
import { useWindowDimensions } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { getBackgroundOpacity } from "$/store/selectors";
import { type SongId, View } from "$/types";

import EventsGrid from "../EventsGrid";
import GlobalShortcuts from "../GlobalShortcuts";
import SongInfo from "../SongInfo";
import BottomPanel from "./BottomPanel";
import EventLightingPreview from "./EventLightingPreview";
import GridControls from "./GridControls";
import KeyboardShortcuts from "./KeyboardShortcuts";

interface Props {
	songId: SongId;
}
const Events = ({ songId }: Props) => {
	const backgroundOpacity = useAppSelector(getBackgroundOpacity);

	const { width: windowWidth } = useWindowDimensions();
	const contentWidth = windowWidth - SIDEBAR_WIDTH;

	return (
		<Fragment>
			<Background>
				<EventLightingPreview />
			</Background>

			<Wrapper>
				<SongInfo songId={songId} showDifficultySelector={false} coverArtSize="small" />

				<MainUI
					style={{
						background: `hsla(222, 32%, 4%, ${backgroundOpacity})`,
					}}
				>
					<GridControls contentWidth={contentWidth} />
					<EventsGrid contentWidth={contentWidth} />
					<BottomPanel contentWidth={contentWidth} />
				</MainUI>

				<GlobalShortcuts view={View.LIGHTSHOW} />
				<KeyboardShortcuts />
			</Wrapper>
		</Fragment>
	);
};

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;

const Background = styled.div`
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
`;

const MainUI = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export default Events;
