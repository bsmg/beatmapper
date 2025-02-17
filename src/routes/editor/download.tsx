import { createFileRoute } from "@tanstack/react-router";

import Download from "$/components/legacy/Download";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/download")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return <Download songId={sid} />;
}
