import type { Assign } from "@ark-ui/react";
import { Children, Fragment, type PropsWithChildren, type ReactNode } from "react";

import { For } from "./for";

interface InterleaveProps {
	separator: (index: number) => ReactNode;
}
export function Interleave({ children, separator }: Assign<PropsWithChildren, InterleaveProps>) {
	return (
		<For each={Children.toArray(children)}>
			{(child, index, array) => (
				<Fragment key={index}>
					{child}
					{index < array.length - 1 && separator(index)}
				</Fragment>
			)}
		</For>
	);
}
