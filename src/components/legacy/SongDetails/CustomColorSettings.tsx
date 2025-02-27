import { Suspense, lazy } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { BEATMAP_COLOR_KEY_RENAME } from "$/constants";
import { toggleModForSong, updateModColor, updateModColorOverdrive } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors } from "$/store/selectors";
import { App } from "$/types";

import CenteredSpinner from "../CenteredSpinner";
import Heading from "../Heading";
import LabeledCheckbox from "../LabeledCheckbox";
import Link from "../Link";
import MiniSlider from "../MiniSlider";
import QuestionTooltip from "../QuestionTooltip";
import Spacer from "../Spacer";

const ColorPicker = lazy(() => import("../ColorPicker"));

const CustomColorSettings = () => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const dispatch = useAppDispatch();

	return (
		<Wrapper>
			<LabeledCheckbox id="enable-colors" checked={customColors.isEnabled} onChange={() => songId && dispatch(toggleModForSong({ songId, mod: "customColors" }))}>
				Enable custom colors{" "}
				<QuestionTooltip>
					Override the default red/blue color scheme. Use "overdrive" to produce some neat effects.{" "}
					<Link forceAnchor to="/docs/$" params={{ _splat: "mods#custom-colors" }}>
						Learn more
					</Link>
					.
				</QuestionTooltip>
			</LabeledCheckbox>

			{customColors.isEnabled && (
				<Suspense fallback={<CenteredSpinner />}>
					<Spacer size={token.var("spacing.4")} />
					<Row>
						{Object.values(App.BeatmapColorKey).map((elementId) => {
							const color = customColors[elementId];
							const overdrive = customColors[`${elementId}Overdrive`];

							return (
								<Cell key={elementId}>
									<ColorPicker colorId={elementId} color={color} updateColor={(element, color) => songId && dispatch(updateModColor({ songId, element, color }))} overdrive={overdrive} />
									<Spacer size={token.var("spacing.2")} />
									<Heading size={3}>{BEATMAP_COLOR_KEY_RENAME[elementId]}</Heading>
									<Spacer size={token.var("spacing.3")} />
									<Heading size={4}>Overdrive</Heading>
									<Spacer size={token.var("spacing.1")} />
									<MiniSlider width={50} height={16} min={0} max={1} step={0.01} value={overdrive} onChange={(ev) => songId && dispatch(updateModColorOverdrive({ songId, element: elementId, overdrive: Number(ev.target.value) }))} />
								</Cell>
							);
						})}
					</Row>
					<Spacer size={token.var("spacing.4")} />
				</Suspense>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  user-select: none;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Cell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default CustomColorSettings;
