import { createFileRoute } from "@tanstack/react-router";

import Events from "$/components/Events";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/events")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid: songId } = Route.useParams();
	return <Events songId={songId} />;
}
