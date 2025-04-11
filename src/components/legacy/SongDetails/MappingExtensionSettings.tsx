import { toggleModForSong } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectIsModuleEnabled } from "$/store/selectors";

import { styled } from "$:styled-system/jsx";
import { Checkbox, Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";
import QuestionTooltip from "../QuestionTooltip";

const MappingExtensionSettings = () => {
	const songId = useAppSelector(selectActiveSongId);
	const isModEnabled = useAppSelector((state) => selectIsModuleEnabled(state, songId, "mappingExtensions"));
	const dispatch = useAppDispatch();

	return (
		<Wrapper>
			<Checkbox id="enable-mapping-extensions" checked={isModEnabled} onCheckedChange={() => songId && dispatch(toggleModForSong({ songId, mod: "mappingExtensions" }))}>
				Enable Mapping Extensions{" "}
				<QuestionTooltip>
					Allows you to customize size and shape of the grid, to place notes outside of the typical 4×3 grid.{" "}
					<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
						<Link to="/docs/$" params={{ _splat: "mods#mapping-extensions" }}>
							Learn more
						</Link>
					</Text>
					.
				</QuestionTooltip>
			</Checkbox>
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		userSelect: "none",
	},
});

export default MappingExtensionSettings;
