import { fastForward } from "react-icons-kit/feather/fastForward";
import { pause } from "react-icons-kit/feather/pause";
import { play } from "react-icons-kit/feather/play";
import { rewind } from "react-icons-kit/feather/rewind";
import { skipBack } from "react-icons-kit/feather/skipBack";
import { skipForward } from "react-icons-kit/feather/skipForward";
import styled from "styled-components";

import { COLORS, SNAPPING_INCREMENTS, UNIT } from "$/constants";
import { changeSnapping, pausePlaying, seekBackwards, seekForwards, skipToEnd, skipToStart, startPlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getIsPlaying, getSnapTo, selectIsLoading } from "$/store/selectors";
import type { View } from "$/types";

import Dropdown from "../Dropdown";
import IconButton from "../IconButton";
import SpacedChildren from "../SpacedChildren";
import Spacer from "../Spacer";
import CurrentBeat from "./CurrentBeat";
import CurrentTime from "./CurrentTime";

interface Props {
	height: number; // TODO: Use `height`
	view: View;
}

const EditorNavigationControls = ({ view }: Props) => {
	const isPlaying = useAppSelector(getIsPlaying);
	const isLoadingSong = useAppSelector(selectIsLoading);
	const snapTo = useAppSelector(getSnapTo);
	const dispatch = useAppDispatch();

	const playButtonAction = isPlaying ? pausePlaying : startPlaying;

	return (
		<Wrapper>
			<Left>
				<Dropdown label="Snap to" value={snapTo} onChange={(ev) => dispatch(changeSnapping({ newSnapTo: Number(ev.target.value) }))} width={165}>
					{SNAPPING_INCREMENTS.map(({ value, label, shortcutLabel }) => (
						<option key={value} value={value} when-selected={label}>
							{label} {shortcutLabel && `(${shortcutLabel})`}
						</option>
					))}
				</Dropdown>
			</Left>
			<Center>
				<SpacedChildren spacing={UNIT}>
					<IconButton disabled={isLoadingSong} color={COLORS.white} icon={skipBack} onClick={() => dispatch(skipToStart())} />
					<IconButton disabled={isLoadingSong} color={COLORS.white} icon={rewind} onClick={() => dispatch(seekBackwards({ view }))} />
					<IconButton disabled={isLoadingSong} color={COLORS.white} icon={isPlaying ? pause : play} onClick={() => dispatch(playButtonAction())} />
					<IconButton disabled={isLoadingSong} color={COLORS.white} icon={fastForward} onClick={() => dispatch(seekForwards({ view }))} />
					<IconButton disabled={isLoadingSong} color={COLORS.white} icon={skipForward} onClick={() => dispatch(skipToEnd())} />
				</SpacedChildren>
			</Center>
			<Right>
				<CurrentTime />
				<Spacer size={UNIT * 4} />
				<CurrentBeat />
			</Right>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;
const Left = styled(Column)`
  justify-content: flex-start;
`;
const Center = styled(Column)`
  justify-content: center;
`;
const Right = styled(Column)`
  justify-content: flex-end;
`;

export default EditorNavigationControls;
