import styled from "styled-components";

import { COLORS } from "$/constants";
import { useLocallyStoredFile } from "$/hooks";

import CenteredSpinner from "../CenteredSpinner";

interface Props {
	filename: string;
	size: number;
}

const CoverArtImage = ({ filename, size }: Props) => {
	const [coverArtUrl] = useLocallyStoredFile<string>(filename);
	const width = size;
	const height = size;

	return coverArtUrl ? (
		<CoverArt src={coverArtUrl} style={{ width, height }} />
	) : (
		<LoadingArtWrapper style={{ width, height }}>
			<CenteredSpinner />
		</LoadingArtWrapper>
	);
};

const CoverArt = styled.img`
  object-fit: cover;
  border-radius: 4px;
`;

const LoadingArtWrapper = styled.div`
  border-radius: 4px;
  background: ${COLORS.gray[500]};
  opacity: 0.25;
`;

export default CoverArtImage;
