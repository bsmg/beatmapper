import type { PropsWithChildren } from "react";
import styled from "styled-components";

import { UNIT } from "$/constants";

interface Props extends PropsWithChildren {
	maxWidth?: number;
}

const MaxWidthWrapper = ({ children, maxWidth = 1000 }: Props) => {
	return <Wrapper style={{ maxWidth }}>{children}</Wrapper>;
};

const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  padding: 0 ${UNIT * 2}px;
`;

export default MaxWidthWrapper;
