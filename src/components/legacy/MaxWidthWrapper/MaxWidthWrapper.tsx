import type { PropsWithChildren } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

interface Props extends PropsWithChildren {
	maxWidth?: number;
}

const MaxWidthWrapper = ({ children, maxWidth = 1000 }: Props) => {
	return <Wrapper style={{ maxWidth }}>{children}</Wrapper>;
};

const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  padding: 0 ${token.var("spacing.2")};
`;

export default MaxWidthWrapper;
