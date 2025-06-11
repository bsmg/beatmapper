import { styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";

export { default as Indicator } from "./indicator";
export { default as Range } from "./range";
export { default as Toggle } from "./toggle";

export const Root = styled("div", {
	base: hstack.raw({
		width: "100%",
		height: "statusBar",
		justify: "space-between",
		gap: 6,
		paddingInline: 2,
		fontSize: "12px",
		backgroundColor: "bg.muted",
		borderTopWidth: "sm",
		borderColor: "border.muted",
		color: "fg.muted",
		overflowX: "auto",
		_scrollbar: { display: "none" },
	}),
});

export const Section = styled("div", {
	base: hstack.raw({
		justify: { base: "flex-start", _last: "flex-end" },
		gap: 6,
	}),
});

export const Group = styled("div", {
	base: hstack.raw({
		gap: 2,
	}),
});
