import { createFileRoute } from "@tanstack/react-router";

import DetailsView from "$/components/app/templates/details";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_page/details")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return <DetailsView sid={sid} />;
}
