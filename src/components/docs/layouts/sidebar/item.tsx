import { RouterLink } from "$/components/ui/compositions";
import type { Doc } from "$:content";
import { styled } from "$:styled-system/jsx";

interface Props {
	entry: Doc;
}
function DocsSidebarNavItem({ entry }: Props) {
	return (
		<RouterLink as={NavLinkWrapper} to={"/docs/$"} params={{ _splat: entry.id }} onClick={() => window.scrollTo({ top: 0 })}>
			{entry.title}
		</RouterLink>
	);
}

const NavLinkWrapper = styled("a", {
	base: {
		height: "35px",
		textStyle: "link",
		colorPalette: "pink",
		color: { base: "fg.muted", _hover: "fg.default", _current: { _light: "colorPalette.700", _dark: "colorPalette.300" } },
		fontWeight: 500,
		fontSize: "16px",
	},
});

export default DocsSidebarNavItem;
