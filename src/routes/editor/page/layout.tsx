import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Container, styled } from "$:styled-system/jsx";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_page")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Wrapper>
			<Container>
				<Outlet />
			</Container>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		maxHeight: "100dvh",
		overflow: "auto",
		paddingBlock: 8,
	},
});
