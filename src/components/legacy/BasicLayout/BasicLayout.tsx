import { Fragment, type PropsWithChildren } from "react";
import styled from "styled-components";

import { FOOTER_HEIGHT, HEADER_HEIGHT, UNIT } from "$/constants";

import Footer from "../Footer";
import Header from "../Header";
import Spacer from "../Spacer";

const HEADER_SPACING = UNIT * 8;

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
  min-height: calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT + HEADER_SPACING}px);
`;

export default BasicLayout;
