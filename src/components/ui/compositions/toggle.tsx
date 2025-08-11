import { type ComponentProps, type MouseEventHandler, useCallback } from "react";

import * as Builder from "$/components/ui/styled/toggle";

interface Props extends ComponentProps<typeof Builder.Root> {
	unfocusOnClick?: boolean;
}

export function Toggle({ children, unfocusOnClick, onClickCapture, ...rest }: Props) {
	const handleClickCapture = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(event) => {
			if (unfocusOnClick) event.currentTarget.blur();
			if (onClickCapture) onClickCapture(event);
		},
		[onClickCapture, unfocusOnClick],
	);

	return (
		<Builder.Root {...rest} onClickCapture={handleClickCapture}>
			{children}
		</Builder.Root>
	);
}
