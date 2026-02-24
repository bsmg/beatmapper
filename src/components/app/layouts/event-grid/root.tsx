import type { Assign } from "@ark-ui/react";
import type { Service } from "@zag-js/core";
import type { ComponentProps } from "react";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { Provider } from "./context";
import { connect, type EventGridSchema } from "./machine";

function EventGridRoot({ children, service, ...rest }: Assign<ComponentProps<typeof Wrapper>, { service: Service<EventGridSchema> }>) {
	const api = connect(service);

	return (
		<Provider value={api}>
			<Wrapper {...rest}>{children}</Wrapper>
		</Provider>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		gap: 0,
		opacity: { base: 1, _loading: 0.25 },
		pointerEvents: { base: "auto", _loading: "none" },
		userSelect: "none",
		overflowX: "clip",
		overflowY: "auto",
		_scrollbar: { display: "none" },
	}),
});

export default EventGridRoot;
