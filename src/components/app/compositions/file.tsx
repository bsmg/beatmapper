import type { Assign } from "@ark-ui/react";
import { type CSSProperties, type ComponentProps, type PropsWithoutRef, useMemo } from "react";

import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import { LocalFilePreview, type LocalFileProps } from "$/components/app/atoms";
import { Spinner } from "$/components/ui/compositions";

interface CoverArtProps extends PropsWithoutRef<ComponentProps<"img">> {
	width?: CSSProperties["width"];
}
export function CoverArtFilePreview({ filename, width, ...rest }: Assign<Omit<LocalFileProps, "children">, CoverArtProps>) {
	const style = useMemo(() => ({ width, height: width }), [width]);
	return (
		<CoverArtWrapper style={style}>
			<LocalFilePreview filename={filename} fallback={<Spinner />}>
				{(src) => <CoverArtImage {...rest} src={src} style={style} />}
			</LocalFilePreview>
		</CoverArtWrapper>
	);
}

const CoverArtWrapper = styled("div", {
	base: center.raw(),
});
const CoverArtImage = styled("img", {
	base: {
		objectFit: "cover",
		borderRadius: "sm",
		aspectRatio: "square",
	},
});
