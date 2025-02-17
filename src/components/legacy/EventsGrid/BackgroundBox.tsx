import styled from "styled-components";

import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors } from "$/store/selectors";
import type { IBackgroundBox } from "$/types";
import { normalize } from "$/utils";

interface Props {
	box: IBackgroundBox;
	startBeat: number;
	numOfBeatsToShow: number;
}

const BackgroundBox = ({ box, startBeat, numOfBeatsToShow }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const startOffset = normalize(box.beatNum, startBeat, numOfBeatsToShow + startBeat, 0, 100);
	const width = normalize(box.duration ?? 0, 0, numOfBeatsToShow, 0, 100);

	return (
		<Wrapper
			style={{
				left: `${startOffset}%`,
				width: `${width}%`,
				background: getColorForItem(box.colorType, customColors),
			}}
		/>
	);
};

const Wrapper = styled.div`
  height: 100%;
  position: absolute;
  opacity: 0.2;
`;

export default BackgroundBox;
