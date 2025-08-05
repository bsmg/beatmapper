import type { Assign } from "@ark-ui/react";
import { type ComponentProps, type CSSProperties, type PropsWithoutRef, useMemo } from "react";

import { LocalFilePreview, type LocalFileProps } from "$/components/app/atoms";
import { Spinner } from "$/components/ui/compositions";
import { BeatmapFilestore } from "$/services/file.service";
import type { SongId } from "$/types";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

interface CoverArtProps extends PropsWithoutRef<ComponentProps<"img">> {
	songId: SongId;
	width?: CSSProperties["width"];
}
export function CoverArtFilePreview({ songId, width, ...rest }: Assign<Omit<LocalFileProps, "filename" | "children">, CoverArtProps>) {
	const style = useMemo(() => ({ width, height: width }), [width]);
	return (
		<CoverArtWrapper style={style}>
			<LocalFilePreview filename={BeatmapFilestore.resolveFilename(songId, "cover", {})} fallback={<Spinner />}>
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
