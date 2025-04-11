import { Fragment, useMemo } from "react";

import { useWindowDimensions } from "$/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectEventBackgroundOpacity } from "$/store/selectors";
import { type SongId, View } from "$/types";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { token } from "$:styled-system/tokens";
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
	const backgroundOpacity = useAppSelector(selectEventBackgroundOpacity);

	const { width: windowWidth } = useWindowDimensions();
	const contentWidth = useMemo(() => windowWidth - Number.parseFloat(token("sizes.sidebar")), [windowWidth]);

	return (
		<Fragment>
			<Background>
				<EventLightingPreview />
			</Background>

			<Wrapper>
				<SongInfo songId={songId} showDifficultySelector={false} coverArtSize="small" />

				<MainUI
					style={{
						background: `color-mix(in srgb, ${token.var("colors.bg.canvas")}, transparent ${(1 - backgroundOpacity) * 100}%)`,
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

const Wrapper = styled("div", {
	base: stack.raw({
		width: "100%",
		height: "100vh",
		justify: "flex-end",
		align: "center",
	}),
});

const Background = styled("div", {
	base: {
		position: "absolute",
		zIndex: 0,
		inset: 0,
		backgroundColor: "black",
	},
});

const MainUI = styled("div", {
	base: stack.raw({
		position: "relative",
		gap: 0,
	}),
});

export default Events;
