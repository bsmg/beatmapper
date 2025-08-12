import { type ComponentProps, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import { For } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/slider";

export interface SliderProps extends ComponentProps<typeof Builder.Root> {
	marks?: Array<number>;
	unfocusOnClick?: boolean;
}
export function Slider({ children, marks, unfocusOnClick, ...rest }: SliderProps) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root thumbAlignment="center" {...rest}>
			<Builder.Control>
				<Builder.Track>
					<Builder.Range />
				</Builder.Track>
				<Builder.Thumb index={0} onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
					<Builder.HiddenInput />
				</Builder.Thumb>
				<Builder.MarkerGroup>
					<For each={marks}>{(value) => <Builder.Marker key={value} value={value} />}</For>
				</Builder.MarkerGroup>
			</Builder.Control>
			{children && <Builder.Label>{children}</Builder.Label>}
		</Builder.Root>
	);
}
