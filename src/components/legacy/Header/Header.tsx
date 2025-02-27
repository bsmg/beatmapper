import styled from "styled-components";
import BaseLink from "../BaseLink";

import { token } from "$:styled-system/tokens";

import Logo from "../Logo";
import MaxWidthWrapper from "../MaxWidthWrapper";

const Header = () => {
	return (
		<Wrapper>
			<MaxWidthWrapper>
				<Contents>
					<Logo />
					<DocLink to="/docs/$" params={{ _splat: "intro" }}>
						Documentation
					</DocLink>
				</Contents>
			</MaxWidthWrapper>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  height: ${token.var("sizes.header")};
  line-height: ${token.var("sizes.header")};
  background: ${token.var("colors.slate.900")};
`;

const Contents = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DocLink = styled(BaseLink)`
  text-decoration: none;
  color: white;

  &:hover {
    text-decoration: underline;
  }
`;

export default Header;
