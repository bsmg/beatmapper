import { Outlet, createFileRoute } from "@tanstack/react-router";

import Layout from "$/components/legacy/Docs/Layout";

export const Route = createFileRoute("/_/docs/_")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Layout>
			<Outlet />
		</Layout>
	);
}
