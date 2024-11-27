import styled from "styled-components";

import { toggleModForSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectIsModuleEnabled } from "$/store/selectors";

import LabeledCheckbox from "../LabeledCheckbox";
import Link from "../Link";
import QuestionTooltip from "../QuestionTooltip";

const MappingExtensionSettings = () => {
	const songId = useAppSelector(selectActiveSongId);
	const isModEnabled = useAppSelector((state) => selectIsModuleEnabled(state, songId, "mappingExtensions"));
	const dispatch = useAppDispatch();

	return (
		<Wrapper>
			<LabeledCheckbox id="enable-mapping-extensions" checked={isModEnabled} onChange={() => songId && dispatch(toggleModForSong({ songId, mod: "mappingExtensions" }))}>
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
