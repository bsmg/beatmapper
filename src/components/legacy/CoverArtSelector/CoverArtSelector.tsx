import { useRef } from "react";
import { Icon } from "react-icons-kit";
import { image } from "react-icons-kit/feather/image";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Spacer from "../Spacer";

interface Props {
	coverArt: string;
}

const CoverArtSelector = ({ coverArt }: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<Wrapper>
			{coverArt ? (
				<CoverArtImage src={coverArt} />
			) : (
				<PlaceholderWrapper>
					<InnerWrapper>
						<IconWrapper>
							<Icon icon={image} size={32} />
						</IconWrapper>
						<Spacer size={token.var("spacing.3")} />
						<Title>Cover Art</Title>
						<Spacer size={token.var("spacing.2")} />
						<Description>Browse for a square cover image, at least 500px wide</Description>

						<FileInput ref={fileInputRef} />
					</InnerWrapper>
				</PlaceholderWrapper>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const CoverArtImage = styled.img``;

const PlaceholderWrapper = styled.div`
  width: 100%;
  height: 100%;
  border: 2px dashed ${token.var("colors.gray.300")};
  border-radius: 8px;
  padding: ${token.var("spacing.1")};
`;

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: ${token.var("spacing.2")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.span`
  color: ${token.var("colors.gray.300")};
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const Description = styled.div`
  font-size: 15px;
  font-weight: 300;
  line-height: 1.4;
  color: ${token.var("colors.gray.100")};
`;

const FileInput = styled.input`
  opacity: 0;
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default CoverArtSelector;
