import { Outlet, createFileRoute } from "@tanstack/react-router";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import DocsSidebar from "$/components/docs/templates/sidebar";

export const Route = createFileRoute("/_/docs/_")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Wrapper>
			<DocsSidebar />
			<MainContent>
				<Outlet />
			</MainContent>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		direction: { base: "column-reverse", md: "row" },
		gap: 0,
		backgroundColor: "bg.canvas",
		color: "fg.default",
	}),
});

const MainContent = styled("main", {
	base: {
		flex: 1,
		height: "100vh",
		overflowY: "auto",
	},
});
