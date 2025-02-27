import { FileImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import FileUploader from "../FileUploader";
import Spinner from "../Spinner";

interface Props {
	height: number;
	coverArtFile: File | null;
	setCoverArtFile: (file: File | null) => void;
}

const CoverArtPicker = ({ height, coverArtFile, setCoverArtFile }: Props) => {
	// HACK: After selecting a file, for a brief moment (a couple frames), the "broken image" border is shown.
	// My useEffect hook SHOULD fire the moment a file is selected, so I'm not sure why it's so problematic...
	// but if I treat it as "always loading when an image isn't visible", the problem goes away.
	const [loadingCoverArtImage, setLoadingCoverArtImage] = useState(true);
	const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);

	useEffect(() => {
		if (!coverArtFile) {
			setCoverArtPreview(null);
			setLoadingCoverArtImage(true);
			return;
		}

		setLoadingCoverArtImage(true);

		const fileReader = new FileReader();

		fileReader.onload = function () {
			setCoverArtPreview(this.result as string);
			setLoadingCoverArtImage(false);
		};

		fileReader.readAsDataURL(coverArtFile);
	}, [coverArtFile]);

	return (
		<FileUploader
			icon={FileImageIcon}
			file={coverArtFile}
			title="Cover Art"
			description="Select a square cover image"
			height={height}
			onSelectFile={setCoverArtFile}
			onClear={() => setCoverArtFile(null)}
			renderWhenFileSelected={() => {
				return <MediaWrapper>{loadingCoverArtImage ? <Spinner /> : coverArtPreview && <CoverArtPreview src={coverArtPreview} />}</MediaWrapper>;
			}}
		/>
	);
};

const MediaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const CoverArtPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

export default CoverArtPicker;
