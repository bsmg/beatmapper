import type { Assign } from "@ark-ui/react";
import { type ComponentProps, useMemo } from "react";

import { LocalFile } from "$/components/app/atoms";
import { Spinner } from "$/components/ui/compositions";
import { Center, styled } from "$:styled-system/jsx";

export interface CoverArtProps {
	boxSize?: number;
}
export function CoverArtFile({ filename, boxSize, ...rest }: Assign<ComponentProps<typeof CoverArt>, CoverArtProps & { filename: string }>) {
	const style = useMemo(() => ({ width: boxSize, height: boxSize }), [boxSize]);

	return (
		<Center style={style}>
			<LocalFile filename={filename} fallback={<Spinner />}>
				{(src) => <CoverArt {...rest} src={src} style={style} />}
			</LocalFile>
		</Center>
	);
}

const CoverArt = styled("img", {
	base: {
		objectFit: "cover",
		borderRadius: "sm",
		aspectRatio: "square",
	},
});
