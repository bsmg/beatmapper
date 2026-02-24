import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { Button } from "$/components/ui/compositions";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

interface Props<T> {
	data: T;
}
function EventGridEventItem<T extends { time: number; selected?: boolean }>({ children, data, ...rest }: Assign<ComponentProps<typeof Button>, Props<T>>) {
	return (
		<Button as={Wrapper} {...rest}>
			{children && <Value>{children}</Value>}
			{data.selected && <SelectedGlow />}
		</Button>
	);
}

const Wrapper = styled("div", {
	base: center.raw({
		width: "8px",
		height: "100%",
		position: "absolute",
		borderRadius: "full",
		zIndex: 1,
		transition: "unset",
	}),
});

const Value = styled("span", {
	base: {
		background: "var(--event-color)",
		fontFamily: "monospace",
		fontWeight: "bold",
		paddingInline: 0.5,
		borderRadius: "sm",
	},
});

const SelectedGlow = styled("div", {
	base: {
		position: "absolute",
		boxSize: "100%",
		inset: 0,
		zIndex: 1,
		colorPalette: "yellow",
		backgroundColor: "colorPalette.500",
		borderRadius: "full",
		opacity: 0.5,
	},
});

export default EventGridEventItem;
