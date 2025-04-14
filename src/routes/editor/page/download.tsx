import { createFileRoute } from "@tanstack/react-router";

import DownloadView from "$/components/app/templates/download";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_page/download")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return <DownloadView sid={sid} />;
}
