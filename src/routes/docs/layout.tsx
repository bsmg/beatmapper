import { createFileRoute, Outlet } from "@tanstack/react-router";

import DocsSidebar from "$/components/docs/templates/sidebar";
import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";

export const Route = createFileRoute("/_/docs/_")({
	component: RouteComponent,
	onEnter: () => {
		document.documentElement.className = localStorage.getItem("dark") === "true" ? "dark" : "light";
	},
	onLeave: () => {
		document.documentElement.className = "dark";
	},
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
		height: "100dvh",
		overflowY: "auto",
	},
});
