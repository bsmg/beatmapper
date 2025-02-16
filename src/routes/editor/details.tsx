import { createFileRoute } from "@tanstack/react-router";

import SongDetails from "$/components/SongDetails";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/details")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return <SongDetails songId={sid} />;
}
