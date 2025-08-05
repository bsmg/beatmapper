import type { ComponentProps } from "react";

import { StrikethroughOnHover as Styled } from "$/components/ui/styled/text";
import type { VirtualColorPalette } from "$/styles/types";
import { css } from "$:styled-system/css";

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
