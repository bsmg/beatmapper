// TODO: Custom spinner!
import { Icon } from "react-icons-kit";
import { loader } from "react-icons-kit/feather/loader";
import styled, { keyframes } from "styled-components";

interface Props {
	size?: number;
}

const Spinner = ({ size = 32 }: Props) => {
	return (
		<Wrapper>
			<Icon icon={loader} size={size} />
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
