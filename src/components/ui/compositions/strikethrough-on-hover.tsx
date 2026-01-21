import type { ComponentProps } from "react";

import { StrikethroughOnHover as Styled } from "$/components/ui/styled/text";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

export interface StrikethroughOnHoverProps extends ComponentProps<typeof Styled>, Pick<SystemStyleObject, "colorPalette"> {}
export function StrikethroughOnHover({ colorPalette = "red", children, ...rest }: StrikethroughOnHoverProps) {
	return (
		<Styled className={css({ colorPalette: colorPalette })} {...rest}>
			{children}
		</Styled>
	);
}
