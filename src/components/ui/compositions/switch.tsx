import { type ComponentProps, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import * as Builder from "$/components/ui/styled/switch";

export interface SwitchProps extends ComponentProps<typeof Builder.Root> {
	unfocusOnClick?: boolean;
}
export function Switch({ children, unfocusOnClick, ...rest }: SwitchProps) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
				<Builder.Thumb />
			</Builder.Control>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.HiddenInput />
		</Builder.Root>
	);
}
