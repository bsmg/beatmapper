import type { ComponentProps } from "react";

import * as Builder from "../styled/switch";

export interface SwitchProps extends ComponentProps<typeof Builder.Root> {}
export function Switch({ children, ...rest }: SwitchProps) {
	return (
		<Builder.Root {...rest}>
			<Builder.Control>
				<Builder.Thumb />
			</Builder.Control>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.HiddenInput />
		</Builder.Root>
	);
}
