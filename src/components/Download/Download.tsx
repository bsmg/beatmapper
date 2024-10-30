import styled from "styled-components";

import { UNIT } from "$/constants";
import { useMount } from "$/hooks";
import { downloadMapFiles, pausePlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getIsPlaying, getSelectedSong } from "$/store/selectors";

import Button from "../Button";
import Heading from "../Heading";
import MiniButton from "../MiniButton";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

const Download = () => {
	const song = useAppSelector(getSelectedSong);
	const isPlaying = useAppSelector(getIsPlaying);
	const dispatch = useAppDispatch();

	// When this component mounts, if the song is playing, pause it.
	useMount(() => {
		if (isPlaying) {
			pausePlaying();
		}
	});

	if (import.meta.env.PROD && song.demo) {
		return (
			<Wrapper>
				<Heading size={1}>Download Map</Heading>
				<Spacer size={UNIT * 2} />
				<Paragraph>Unfortunately, the demo map is not available for download.</Paragraph>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			<Heading size={1}>Download Map</Heading>
			<Spacer size={UNIT * 2} />
			<Paragraph>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Paragraph>
			<Spacer size={UNIT * 2} />
			<Button style={{ margin: "auto" }} onClick={() => dispatch(downloadMapFiles({ version: 2 }))}>
				Download map files
			</Button>
			<Spacer size={UNIT * 6} />
			<Paragraph>If you wish to import your map into other map software, you may need to download a legacy version of the map files.</Paragraph>
			<Spacer size={UNIT * 2} />
			<MiniButton style={{ margin: "auto" }} onClick={() => dispatch(downloadMapFiles({ version: 1 }))}>
				Download legacy files
			</MiniButton>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  max-width: 400px;
  margin: ${UNIT * 8}px auto;
  padding: ${UNIT * 4}px;
  background: rgba(255, 255, 255, 0.075);
  text-align: center;
`;

export default Download;
