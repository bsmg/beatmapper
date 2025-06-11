import { Fragment, type PropsWithChildren } from "react";

import { Container, styled } from "$:styled-system/jsx";
import Footer from "./footer";
import Header from "./header";

function AppPageLayout({ children }: PropsWithChildren) {
	return (
		<Fragment>
			<Header />
			<MainContent>{children}</MainContent>
			<Footer />
		</Fragment>
	);
}

const MainContent = styled(Container, {
	base: {
		flex: 1,
		minHeight: "calc(100vh - {sizes.header} - {sizes.footer})",
		paddingBlock: 8,
	},
});

export default AppPageLayout;
