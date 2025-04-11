import { docs } from "velite:content";
import { createListCollection } from "@ark-ui/react/collection";

import { styled } from "$:styled-system/jsx";
import { center, stack } from "$:styled-system/patterns";
import { Accordion, Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";
import Logo from "../Logo";

function getDocsForCategory(category: string | null) {
	return docs.filter((x) => x.category === category).sort((a, b) => a.order - b.order);
}

const DOCS_LIST_COLLECTION = createListCollection({
	items: ["manual", "advanced", "release-notes", "legal"].map((category, index) => {
		return {
			value: category,
			label: ["User Manual", "Advanced", "Release Notes", "Legal"][index],
			render: () => (
				<NavLinkGroup>
					{getDocsForCategory(category).map((entry) => (
						<NavLinkWrapper key={entry.id} asChild onClick={() => window.scrollTo({ top: 0 })}>
							<Link to={"/docs/$"} params={{ _splat: entry.id }}>
								{entry.title}
							</Link>
						</NavLinkWrapper>
					))}
				</NavLinkGroup>
			),
		};
	}),
});

const Sidebar = () => {
	return (
		<Wrapper>
			<Header>
				<Logo />
			</Header>
			<Navigation>
				<NavLinkGroup>
					{getDocsForCategory(null).map((entry) => (
						<NavLinkWrapper key={entry.id} asChild onClick={() => window.scrollTo({ top: 0 })}>
							<Link to={"/docs/$"} params={{ _splat: entry.id }}>
								{entry.title}
							</Link>
						</NavLinkWrapper>
					))}
				</NavLinkGroup>
				<Accordion collection={DOCS_LIST_COLLECTION} multiple />
			</Navigation>
		</Wrapper>
	);
};

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
		gap: 0,
		padding: 1.5,
		overflowY: { base: "visible", md: "auto" },
	}),
});

const NavLinkGroup = styled("div", {
	base: stack.raw({
		gap: 0,
		paddingInline: 1.5,
	}),
});

const NavLinkWrapper = styled(Text, {
	base: {
		height: "35px",
		textStyle: "link",
		colorPalette: "pink",
		color: { base: "fg.muted", _hover: "fg.default", _active: "colorPalette.700" },
		fontWeight: 500,
		fontSize: "16px",
	},
});

export default Sidebar;
