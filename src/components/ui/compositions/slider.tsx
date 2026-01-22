import type { ComponentProps } from "react";

import { For } from "$/components/ui/atoms";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/slider";

export interface SliderProps extends ComponentProps<typeof Builder.Root>, UseInteractableOptions {
	marks?: Array<number>;
}
export function Slider({ children, marks, unfocusOnPress, ...rest }: SliderProps) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root thumbAlignment="center" {...rest}>
			<Builder.Control>
				<Builder.Track>
					<Builder.Range />
				</Builder.Track>
				<Builder.Thumb index={0} onClickCapture={handlePress} onKeyDownCapture={handlePress}>
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
