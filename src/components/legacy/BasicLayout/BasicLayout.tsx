import { Fragment, type PropsWithChildren } from "react";

import { Container, styled } from "$:styled-system/jsx";
import Footer from "../Footer";
import Header from "../Header";

interface Props extends PropsWithChildren {}

const BasicLayout = ({ children }: Props) => {
	return (
		<Fragment>
			<Header />
			<MainContent>{children}</MainContent>
			<Footer />
		</Fragment>
	);
};

const MainContent = styled(Container, {
	base: {
		flex: 1,
		minHeight: "calc(100vh - {sizes.header} - {sizes.footer})",
		paddingBlock: 8,
	},
});

export default BasicLayout;
