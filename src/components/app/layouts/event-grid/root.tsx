import type { ComponentProps } from "react";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";

function EventGridRoot({ children, ...rest }: ComponentProps<typeof Wrapper>) {
	return <Wrapper {...rest}>{children}</Wrapper>;
}

const Wrapper = styled("div", {
	base: stack.raw({
		gap: 0,
		opacity: { base: 1, _loading: 0.25 },
		pointerEvents: { base: "auto", _loading: "none" },
		userSelect: "none",
		overflowX: "clip",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

export default EventGridRoot;
