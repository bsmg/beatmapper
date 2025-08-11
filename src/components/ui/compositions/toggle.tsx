import { type ComponentProps, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import * as Builder from "$/components/ui/styled/toggle";

interface Props extends ComponentProps<typeof Builder.Root> {
	unfocusOnClick?: boolean;
}

export function Toggle({ children, unfocusOnClick, ...rest }: Props) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root {...rest} onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
			{children}
		</Builder.Root>
	);
}
