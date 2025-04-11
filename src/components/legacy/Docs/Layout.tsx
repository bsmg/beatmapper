import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import SearchHeader from "./SearchHeader";
import Sidebar from "./Sidebar";

interface Props extends PropsWithChildren {}

const Layout = ({ children }: Props) => {
	return (
		<Wrapper className="light">
			<Sidebar />
			<MainContent>
				<SearchHeader />
				{children}
			</MainContent>
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: stack.raw({
		direction: { base: "column-reverse", md: "row" },
		gap: 0,
		backgroundColor: "bg.canvas",
		color: "fg.default",
	}),
});

const MainContent = styled("main", {
	base: {
		flex: 1,
		height: "100vh",
		overflowY: "auto",
	},
});

export default Layout;
