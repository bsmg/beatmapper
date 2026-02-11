import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { styled } from "$:styled-system/jsx";

interface Props {
	disabled: boolean;
}
function EventGridTrack({ children, disabled, ...rest }: Assign<ComponentProps<typeof Wrapper>, Props>) {
	return (
		<Wrapper {...rest} aria-disabled={disabled} onContextMenu={(ev) => ev.preventDefault()}>
			{children}
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		position: "relative",
		backgroundColor: { base: undefined, _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
	},
});

export default EventGridTrack;
