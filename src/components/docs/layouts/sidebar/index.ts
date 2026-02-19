import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";

export { default as NavItem } from "./item";
export { default as Root } from "./root";
export { default as DocsThemeToggle } from "./theme-toggle";

export const NavGroup = styled("div", {
	base: stack.raw({
		gap: 0,
		paddingInline: 1.5,
	}),
});
