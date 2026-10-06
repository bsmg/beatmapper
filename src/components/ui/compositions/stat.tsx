import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import * as Builder from "$/components/ui/styled/stat";

export interface StatProps {
	label?: string;
}

export function Stat({ label, children, ...rest }: Assign<ComponentProps<typeof Builder.Root>, StatProps>) {
	return (
		<Builder.Root {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.ValueText>{children}</Builder.ValueText>
		</Builder.Root>
	);
}
