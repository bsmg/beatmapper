import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import { EditorActionPanel } from "$/components/app/templates/editor";
import { EditorBeatmapShortcuts } from "$/components/app/templates/shortcuts";
import MapVisualization from "$/components/legacy/MapVisualization";
import ReduxForwardingCanvas from "$/components/legacy/ReduxForwardingCanvas";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization />
			</ReduxForwardingCanvas>
			<EditorActionPanel sid={sid} />
			<EditorBeatmapShortcuts />
		</Fragment>
	);
}
