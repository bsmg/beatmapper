import type { ComponentProps } from "react";

import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/switch";

export interface SwitchProps extends ComponentProps<typeof Builder.Root>, UseInteractableOptions {}
export function Switch({ children, unfocusOnPress, ...rest }: SwitchProps) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
				<Builder.Thumb />
			</Builder.Control>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.HiddenInput />
		</Builder.Root>
	);
}
