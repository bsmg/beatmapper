import { styled } from "$:styled-system/jsx";
import { divider, vstack } from "$:styled-system/patterns";

export { default as Item } from "./item";

export const Root = styled("nav", {
	base: vstack.raw({
		position: "relative",
		width: "sidebar",
		height: "100vh",
		justify: "space-between",
		gap: 2,
		paddingBlock: 2,
		backgroundColor: "bg.subtle",
		borderRightWidth: "sm",
		borderColor: "border.muted",
		userSelect: "none",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

export const Divider = styled("div", {
	base: divider.raw({
		color: "border.default",
		borderStyle: "dotted",
	}),
});

export const Section = styled("div", {
	base: vstack.raw({
		gap: 2,
	}),
});
