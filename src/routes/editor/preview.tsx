import { createFileRoute } from "@tanstack/react-router";

import Preview from "$/components/Preview";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/preview")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Preview />;
}
