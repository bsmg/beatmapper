import { createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { Link as Styled } from "$/components/ui/styled/link";

export function AnchorLink({ children, ...rest }: ComponentProps<typeof Styled>) {
	return <Styled {...rest}>{children}</Styled>;
}

export const RouterLink = createLink(AnchorLink);
