import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

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
	base: {
		layerStyle: "fill.ghost",
		padding: 1,
		borderRadius: "sm",
		marginBlock: 1.5,
		"& img": {
			borderRadius: "sm",
		},
	},
});

const ImageCaption = styled("span", {
	base: {
		textAlign: "center",
		fontSize: "12px",
		lineHeight: 1.5,
		marginTop: 1,
	},
});

export default DocsMedia;
