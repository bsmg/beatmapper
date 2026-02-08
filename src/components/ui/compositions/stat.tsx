import type { Assign } from "@ark-ui/react";
import type { PropsWithChildren } from "react";

import * as Builder from "$/components/ui/styled/stat";

export interface StatProps {
	label?: string;
}

export function Stat({ label, children }: Assign<PropsWithChildren, StatProps>) {
	return (
		<Builder.Root>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.ValueText>{children}</Builder.ValueText>
		</Builder.Root>
	);
}
