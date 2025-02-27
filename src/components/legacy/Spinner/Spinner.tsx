import { LoaderIcon, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import styled, { keyframes } from "styled-components";

interface Props {
	icon?: ComponentType<LucideProps>;
	size?: number;
}

const Spinner = ({ icon: Icon = LoaderIcon, size = 32 }: Props) => {
	return (
		<Wrapper>
			<Icon size={size} />
		</Wrapper>
	);
};

const endlessRotation = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  color: white;
  opacity: 0.75;
  animation: ${endlessRotation} 2s linear infinite;

  & * {
    display: block !important;
  }
`;

export default Spinner;
