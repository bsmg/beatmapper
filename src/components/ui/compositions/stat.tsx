import type { PropsWithChildren, ReactNode } from "react";

import * as Builder from "../styled/stat";

interface Props extends PropsWithChildren {
	label?: ReactNode;
}
export function Stat({ label, children }: Props) {
	return (
		<Builder.Root>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.ValueText>{children}</Builder.ValueText>
		</Builder.Root>
	);
}
