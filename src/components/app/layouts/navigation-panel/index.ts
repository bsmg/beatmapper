import { styled } from "$:styled-system/jsx";
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
		justify: { base: "center", _first: "flex-start", _last: "flex-end" },
		flex: 1,
		gap: { base: 1, _first: 4, _last: 4 },
	}),
});
