import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { center, stack } from "$:styled-system/patterns";
import { Logo } from "$/components/app/compositions";
import { DocsThemeToggle } from "$/components/docs/compositions";

function DocsSidebarRoot({ children }: PropsWithChildren) {
	return (
		<Wrapper>
			<Header>
				<Logo />
			</Header>
			<Navigation>{children}</Navigation>
			<Footer>
				<DocsThemeToggle />
			</Footer>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		minWidth: "300px",
		maxHeight: "100vh",
		gap: 0,
		fontFamily: "'system'",
		backgroundColor: "bg.default",
		borderTopWidth: { base: "sm", md: 0 },
		borderRightWidth: { base: 0, md: "sm" },
		borderColor: "border.default",
	}),
});

const Header = styled("header", {
	base: center.raw({
		minHeight: "header",
		borderBottomWidth: "sm",
		borderColor: "border.default",
	}),
});

const Navigation = styled("nav", {
	base: stack.raw({
		height: "100%",
		gap: 1,
		padding: 1.5,
		overflowY: { base: "visible", md: "auto" },
	}),
});

const Footer = styled("footer", {
	base: center.raw({
		paddingBlock: 1,
		borderTopWidth: "sm",
		borderColor: "border.default",
	}),
});

export default DocsSidebarRoot;
