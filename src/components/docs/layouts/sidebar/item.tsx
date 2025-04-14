import type { Doc } from "velite:content";
import { Link } from "@tanstack/react-router";

import { styled } from "$:styled-system/jsx";
import { Text } from "$/components/ui/compositions";

interface Props {
	entry: Doc;
}
function DocsSidebarNavItem({ entry }: Props) {
	return (
		<NavLinkWrapper asChild onClick={() => window.scrollTo({ top: 0 })}>
			<Link to={"/docs/$"} params={{ _splat: entry.id }}>
				{entry.title}
			</Link>
		</NavLinkWrapper>
	);
}

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

export default DocsSidebarNavItem;
