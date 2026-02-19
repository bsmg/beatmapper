import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { center, vstack } from "$:styled-system/patterns";

function Root({ children }: PropsWithChildren) {
	return (
		<OuterWrapper onWheel={(ev) => ev.stopPropagation()}>
			<Wrapper>{children}</Wrapper>
		</OuterWrapper>
	);
}

const OuterWrapper = styled("div", {
	base: center.raw({
		position: "absolute",
		top: 0,
		bottom: "calc({sizes.navigationPanel} + {sizes.statusBar})",
		right: 0,
		width: "200px",
		pointerEvents: "none",
	}),
});

const Wrapper = styled("div", {
	base: vstack.raw({
		height: "fit-content",
		maxHeight: "100%",
		justify: "start",
		padding: 4,
		gap: 4,
		backgroundColor: "bg.translucent",
		color: "fg.default",
		borderLeftRadius: "md",
		borderBlockWidth: "sm",
		borderLeftWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(8px)",
		pointerEvents: "auto",
		userSelect: "none",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

export default Root;
