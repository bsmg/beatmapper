import type { ComponentProps } from "react";

import * as Builder from "../styled/toggle";

interface Props extends ComponentProps<typeof Builder.Root> {}

export function Toggle({ children, ...rest }: Props) {
	return <Builder.Root {...rest}>{children}</Builder.Root>;
}
