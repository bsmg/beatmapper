import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { useMount } from "$/hooks";
import { downloadMapFiles, pausePlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsDemoSong, selectIsPlaying } from "$/store/selectors";
import type { SongId } from "$/types";

import Button from "../Button";
import Heading from "../Heading";
import MiniButton from "../MiniButton";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

interface Props {
	songId: SongId;
}
const Download = ({ songId }: Props) => {
	const isDemo = useAppSelector((state) => selectIsDemoSong(state, songId));
	const isPlaying = useAppSelector(selectIsPlaying);
	const dispatch = useAppDispatch();

	// When this component mounts, if the song is playing, pause it.
	useMount(() => {
		if (isPlaying) {
			pausePlaying();
		}
	});

	if (import.meta.env.PROD && isDemo) {
		return (
			<Wrapper>
				<Heading size={1}>Download Map</Heading>
				<Spacer size={token.var("spacing.2")} />
				<Paragraph>Unfortunately, the demo map is not available for download.</Paragraph>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			<Heading size={1}>Download Map</Heading>
			<Spacer size={token.var("spacing.2")} />
			<Paragraph>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Paragraph>
			<Spacer size={token.var("spacing.2")} />
			<Button style={{ margin: "auto" }} onClick={() => dispatch(downloadMapFiles({ songId, version: 2 }))}>
				Download map files
			</Button>
			<Spacer size={token.var("spacing.6")} />
			<Paragraph>If you wish to import your map into other map software, you may need to download a legacy version of the map files.</Paragraph>
			<Spacer size={token.var("spacing.2")} />
			<MiniButton style={{ margin: "auto" }} onClick={() => dispatch(downloadMapFiles({ songId, version: 1 }))}>
				Download legacy files
			</MiniButton>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  max-width: 400px;
  margin: ${token.var("spacing.8")} auto;
  padding: ${token.var("spacing.4")};
  background: rgba(255, 255, 255, 0.075);
  text-align: center;
`;

export default Download;
