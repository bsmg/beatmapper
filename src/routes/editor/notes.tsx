import { createFileRoute } from "@tanstack/react-router";

import NotesEditor from "$/components/NotesEditor";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid: songId } = Route.useParams();
	return <NotesEditor songId={songId} />;
}
