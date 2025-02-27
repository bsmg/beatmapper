import { Fragment, type PropsWithChildren } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Footer from "../Footer";
import Header from "../Header";
import Spacer from "../Spacer";

const HEADER_SPACING = token.var("spacing.8");

interface Props extends PropsWithChildren {}

const BasicLayout = ({ children }: Props) => {
	return (
		<Fragment>
			<Header />
			<Spacer size={HEADER_SPACING} />
			<MainContent>{children}</MainContent>
			<Footer />
		</Fragment>
	);
};

const MainContent = styled.div`
  min-height: calc(100vh - ${token.var("sizes.header")} - ${token.var("sizes.footer")} - ${HEADER_SPACING});
`;

export default BasicLayout;
