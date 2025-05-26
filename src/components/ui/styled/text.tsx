import { ark } from "@ark-ui/react/factory";

import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import { createLink } from "@tanstack/react-router";

export const Paragraph = styled(ark.p, {
	base: {
		textStyle: "paragraph",
		fontSize: "1rem",
	},
});

export const KBD = styled(ark.kbd, {
	base: center.raw({
		display: "inline-flex",
		marginInline: "0.25em",
		marginBottom: "-0.25em",
		paddingBlock: "0.125rem",
		paddingInline: "0.75em",
		lineHeight: "1.25em",
		fontSize: "0.75em",
		textTransform: "uppercase",
		backgroundColor: "bg.muted",
		color: "fg.muted",
		borderWidth: "sm",
		borderBottomWidth: "lg",
		borderColor: "border.muted",
		borderRadius: "sm",
		transform: "translateY(-0.125em)",
	}),
});

export const AnchorLink = styled(ark.a, {
	base: {
		textStyle: "link",
		cursor: "pointer",
		color: "fg.default",
	},
});
export const RouterLink = createLink(
	styled("a", {
		base: {
			textStyle: "link",
			cursor: "pointer",
			color: "fg.default",
		},
	}),
);

export const StrikethroughOnHover = styled(ark.span, {
	base: {
		position: "relative",
		_hover: {
			_after: {
				content: "''",
				position: "absolute",
				top: "50%",
				insetInline: "-2px",
				borderWidth: "sm",
				borderColor: "colorPalette.500",
				borderRadius: "sm",
				pointerEvents: "none",
			},
		},
	},
});
