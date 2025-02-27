import type { ComponentProps } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

interface Props extends ComponentProps<"h4"> {
	size: 1 | 2 | 3 | 4;
}

const Heading = ({ ref, size, ...delegated }: Props) => {
	const Elem = HeadingArr[size - 1];
	return <Elem {...delegated} />;
};

const HeadingBase = styled.h4`
  font-family: 'Oswald', sans-serif;
  font-weight: 300;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${token.var("colors.gray.300")};
`;

const H1 = styled(HeadingBase)`
  font-size: 28px;
  letter-spacing: 2px;
`;
const H2 = styled(HeadingBase)`
  font-size: 24px;
  letter-spacing: 2px;
`;
const H3 = styled(HeadingBase)`
  font-size: 16px;
  letter-spacing: 1.5px;
`;
const H4 = styled(HeadingBase)`
  font-size: 12px;
  letter-spacing: 1px;
`;

const HeadingArr = [H1, H2, H3, H4] as const;

export default Heading;
