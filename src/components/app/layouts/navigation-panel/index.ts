import { HStack, styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";

export { default as Root } from "./root";

export const Section = styled("div", {
	base: hstack.raw({
		gap: 4,
		justify: "space-between",
		overflowX: "auto",
		_scrollbar: { display: "none" },
	}),
});

export const Column = styled("div", {
	base: hstack.raw({
		width: "fit-content",
		justify: "space-between",
		flex: 1,
		gap: 4,
	}),
});

export const Group = styled("div", {
	base: hstack.raw({
		justify: { _first: "flex-start", _last: "flex-end" },
	}),
	variants: {
		size: {
			sm: { gap: 1 },
			md: { gap: 4 },
		},
	},
});
