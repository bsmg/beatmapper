import { type CSSProperties, useMemo } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { useLocallyStoredFile } from "$/hooks";

import CenteredSpinner from "../CenteredSpinner";

interface Props {
	filename: string;
	size: CSSProperties["width"];
}

const CoverArtImage = ({ filename, size }: Props) => {
	const [coverArtUrl] = useLocallyStoredFile<string>(filename);

	const style = useMemo(() => ({ width: size, height: size }), [size]);

	return coverArtUrl ? (
		<CoverArt src={coverArtUrl} style={style} />
	) : (
		<LoadingArtWrapper style={style}>
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
  background: ${token.var("colors.gray.500")};
  opacity: 0.25;
`;

export default CoverArtImage;
