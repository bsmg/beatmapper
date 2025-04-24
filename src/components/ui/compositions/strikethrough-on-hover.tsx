import type { ComponentProps } from "react";

import { css } from "$:styled-system/css";
import { StrikethroughOnHover as Styled } from "../styled/text";
import type { VirtualColorPalette } from "../types";

export interface StrikethroughOnHoverProps extends ComponentProps<typeof Styled> {
	colorPalette?: VirtualColorPalette;
}
export function StrikethroughOnHover({ colorPalette = "red", children, ...rest }: StrikethroughOnHoverProps) {
	return (
		<Styled className={css({ colorPalette: colorPalette })} {...rest}>
			{children}
		</Styled>
	);
}
