import styled from "styled-components";

import { toggleModForSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getSelectedSong } from "$/store/selectors";

import LabeledCheckbox from "../LabeledCheckbox";
import Link from "../Link";
import QuestionTooltip from "../QuestionTooltip";

const MappingExtensionSettings = () => {
	const song = useAppSelector(getSelectedSong);
	const dispatch = useAppDispatch();

	const isModEnabled = !!song.modSettings.mappingExtensions?.isEnabled;

	return (
		<Wrapper>
			<LabeledCheckbox id="enable-mapping-extensions" checked={isModEnabled} onChange={() => dispatch(toggleModForSong({ mod: "mappingExtensions" }))}>
				Enable Mapping Extensions{" "}
				<QuestionTooltip>
					Allows you to customize size and shape of the grid, to place notes outside of the typical 4×3 grid.{" "}
					<Link forceAnchor to="/docs/mods#mapping-extensions">
						Learn more
					</Link>
					.
				</QuestionTooltip>
			</LabeledCheckbox>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  user-select: none;
`;

export default MappingExtensionSettings;
