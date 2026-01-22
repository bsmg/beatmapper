import type { ComponentProps } from "react";

import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/toggle";

interface Props extends ComponentProps<typeof Builder.Root>, UseInteractableOptions {}

export function Toggle({ children, unfocusOnPress, ...rest }: Props) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest} onClickCapture={handlePress} onKeyDownCapture={handlePress}>
			{children}
		</Builder.Root>
	);
}
