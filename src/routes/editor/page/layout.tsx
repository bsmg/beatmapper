import { Container, styled } from "$:styled-system/jsx";
import { Outlet, createFileRoute } from "@tanstack/react-router";

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
		maxHeight: "100vh",
		overflow: "auto",
		paddingBlock: 8,
	},
});
