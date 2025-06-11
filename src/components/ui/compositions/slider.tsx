import type { ComponentProps } from "react";

import { For } from "../atoms";
import * as Builder from "../styled/slider";

export interface SliderProps extends ComponentProps<typeof Builder.Root> {
	marks?: Array<number>;
}
export function Slider({ children, marks, ...rest }: SliderProps) {
	return (
		<Builder.Root thumbAlignment="center" {...rest}>
			<Builder.Control>
				<Builder.Track>
					<Builder.Range />
				</Builder.Track>
				<Builder.Thumb index={0}>
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
