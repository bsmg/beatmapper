import styled from "styled-components";

import { COLORS, FOOTER_HEIGHT, UNIT } from "$/constants";

import Link from "../Link";
import Logo from "../Logo";
import MaxWidthWrapper from "../MaxWidthWrapper";
import Spacer from "../Spacer";

const Footer = () => {
	return (
		<Wrapper>
			<MaxWidthWrapper>
				<InnerWrapper style={{ height: FOOTER_HEIGHT }}>
					<LogoWrapper>
						<Logo size="mini" />
						<Spacer size={UNIT} />
						<Links>
							<Link to="/docs/$" params={{ _splat: "privacy" }}>
								Privacy
							</Link>{" "}
							·{" "}
							<Link to="/docs/$" params={{ _splat: "content-policy" }}>
								Content Policy
							</Link>
						</Links>
					</LogoWrapper>
					<Info>
						A side-project by <ExternalLink href="https://twitter.com/JoshWComeau">Josh Comeau</ExternalLink>. Maintained by <ExternalLink href="https://bsmg.wiki/">BSMG</ExternalLink>.
						<br />
						<Symbol>©</Symbol> 2019-present, All rights reserved.
						<br />
						<Spacer size={UNIT} />
						<Disclaimer>
							Not affiliated with Beat Games<Symbol>™</Symbol> or Beat Saber
							<Symbol>™</Symbol>.
						</Disclaimer>
					</Info>
				</InnerWrapper>
			</MaxWidthWrapper>
		</Wrapper>
	);
};

const Wrapper = styled.footer`
  font-size: 14px;
  font-weight: 300;
  background: hsla(0, 0%, 92%, 0.05);
  color: ${COLORS.blueGray[300]};
`;

const LogoWrapper = styled.div``;

const Symbol = styled.span`
  display: inline-block;
  font-size: 0.6em;
  transform: translateY(-40%);
`;

const InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Info = styled.div`
  text-align: right;
  font-size: 14px;
  line-height: 1.4;
`;

const Disclaimer = styled.div`
  color: ${COLORS.blueGray[400]};
`;

const ExternalLink = styled.a`
  color: ${COLORS.blueGray[100]};
  font-weight: 400;
  text-decoration: none;
`;

const Links = styled.div`
  & a {
    color: inherit !important;
    font-weight: 400;
  }
`;

export default Footer;
