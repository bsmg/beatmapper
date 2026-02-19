import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/toggle";

export interface ToggleProps extends UseInteractableOptions {}

export function Toggle({ children, unfocusOnPress, ...rest }: Assign<ComponentProps<typeof Builder.Root>, ToggleProps>) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest} onClickCapture={handlePress} onKeyDownCapture={handlePress}>
			{children}
		</Builder.Root>
	);
}
