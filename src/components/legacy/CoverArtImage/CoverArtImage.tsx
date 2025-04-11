import { type CSSProperties, useMemo } from "react";

import { convertFileToDataUrl } from "$/helpers/file.helpers";
import { useLocalFileQuery } from "$/hooks";

import { Center, styled } from "$:styled-system/jsx";
import { Spinner } from "$/components/ui/compositions";

interface Props {
	filename: string;
	size: CSSProperties["width"];
}

const CoverArtImage = ({ filename, size }: Props) => {
	const { data: coverArtUrl, isFetching } = useLocalFileQuery<string>(filename, {
		queryKeySuffix: "preview",
		transform: async (file) => await convertFileToDataUrl(file),
	});

	const style = useMemo(() => ({ width: size, height: size }), [size]);

	if (isFetching) {
		return (
			<LoadingArtWrapper style={style}>
				<Spinner />
			</LoadingArtWrapper>
		);
	}
	return coverArtUrl && <CoverArt src={coverArtUrl} style={style} />;
};

const CoverArt = styled("img", {
	base: {
		objectFit: "cover",
		borderRadius: "sm",
	},
});

const LoadingArtWrapper = styled(Center, {
	base: {
		backgroundColor: "bg.muted",
		borderRadius: "sm",
	},
});

export default CoverArtImage;
