import type { Assign } from "@ark-ui/react";
import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, useMemo } from "react";

import { Heading as Styled } from "$/components/ui/styled/heading";

const ARR = [ark.h1, ark.h2, ark.h3, ark.h4, ark.h5, ark.h6] as const;

export interface HeadingProps {
	rank: 1 | 2 | 3 | 4 | 5 | 6;
}
export function Heading({ rank = 1, ...rest }: Assign<ComponentProps<typeof Styled>, HeadingProps>) {
	const Element = useMemo(() => ARR[rank - 1], [rank]);

	return <Styled as={Element} rank={rank.toString() as `${1 | 2 | 3 | 4 | 5 | 6}`} {...rest} />;
}
