import type { Assign } from "@ark-ui/react";
import { type ComponentProps, forwardRef } from "react";

import { Show } from "$/components/ui/atoms";
import { Spinner } from "$/components/ui/compositions";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

interface Props {
	isLoading?: boolean;
}
const AudioVisualizerRoot = forwardRef<HTMLDivElement, Assign<ComponentProps<"div">, Props>>(({ isLoading, children, ...rest }, ref) => {
	return (
		<Wrapper {...rest} ref={ref}>
			<Show when={!isLoading} fallback={<Spinner />}>
				{children}
			</Show>
		</Wrapper>
	);
});

const Wrapper = styled("div", {
	base: center.raw({
		width: "100%",
		height: "60px",
	}),
});

export default AudioVisualizerRoot;
