import styled from "styled-components";

interface Props {
	x?: number;
	y?: number;
}

const PixelShifter = styled.div<Props>`
  transform: ${(props) => `translate(${props.x || 0}px, ${props.y || 0}px)}`};
`;

export default PixelShifter;
