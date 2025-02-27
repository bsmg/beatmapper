import { type CSSProperties, type ComponentProps, useMemo } from "react";
import styled from "styled-components";

import { pixelSrc } from "$/assets";

interface Props extends ComponentProps<typeof Wrapper> {
	size: CSSProperties["width" | "height"];
}

export function Spacer({ size, ...rest }: Props) {
	const spacing = useMemo(() => {
		const gap = typeof size === "string" ? size : `${size}px`;
		return { width: gap, height: gap };
	}, [size]);

	return <Wrapper style={spacing} {...rest} />;
}

const Wrapper = styled.img.attrs({ src: pixelSrc })`
  display: block;
  pointer-events: none;
  user-select: none;
`;

export default Spacer;
