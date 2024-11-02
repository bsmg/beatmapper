import styled from "styled-components";

import { pixelSrc } from "$/assets";

interface Props {
	size: number;
}

const Spacer = styled.img.attrs<Props>({ src: pixelSrc })`
  display: block;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  pointer-events: none;
  user-select: none;
`;

export default Spacer;
