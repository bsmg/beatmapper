import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { center, stack } from "$:styled-system/patterns";

interface Props extends PropsWithChildren {
	caption?: string;
}
function DocsMedia({ caption, children }: Props) {
	return (
		<OuterImageWrapper>
			<ImageWrapper>
				{children}
				{caption && <ImageCaption>{caption}</ImageCaption>}
			</ImageWrapper>
		</OuterImageWrapper>
	);
}

const OuterImageWrapper = styled("span", {
	base: center.raw({
		width: "100%",
		marginInline: -1,
	}),
});

const ImageWrapper = styled("span", {
	base: stack.raw({
		layerStyle: "fill.ghost",
		padding: 1,
		marginBlock: 1.5,
		borderRadius: "sm",
		"& img": {
			borderRadius: "sm",
		},
	}),
});

const ImageCaption = styled("span", {
	base: {
		textAlign: "start",
		fontSize: "14px",
		lineHeight: 1.5,
	},
});

export default DocsMedia;
