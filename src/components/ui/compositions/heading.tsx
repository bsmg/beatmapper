import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, useMemo } from "react";

import { Heading as Styled } from "$/components/ui/styled/heading";

const ARR = [ark.h1, ark.h2, ark.h3, ark.h4, ark.h5, ark.h6] as const;

export interface HeadingProps extends ComponentProps<typeof Styled> {}
export function Heading({ rank = 1, ...rest }: HeadingProps) {
	const Element = useMemo(() => ARR[rank - 1], [rank]);
	return (
		<Styled rank={rank} asChild>
			<Element {...rest} />
		</Styled>
	);
}
