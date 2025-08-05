import { type ComponentProps, forwardRef } from "react";

import { Spinner } from "$/components/ui/compositions";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

interface Props extends ComponentProps<"div"> {
	isLoading?: boolean;
}
const AudioVisualizerRoot = forwardRef<HTMLDivElement, Props>(({ isLoading, children, ...rest }, ref) => {
	return (
		<Wrapper {...rest} ref={ref}>
			{isLoading && (
				<SpinnerWrapper>
					<Spinner />
				</SpinnerWrapper>
			)}
			{children}
		</Wrapper>
	);
});

const Wrapper = styled("div", {
	base: {
		width: "100%",
		height: "60px",
	},
});

const SpinnerWrapper = styled("div", {
	base: center.raw({
		position: "absolute",
		inset: 0,
		boxSize: "100%",
	}),
});

export default AudioVisualizerRoot;
