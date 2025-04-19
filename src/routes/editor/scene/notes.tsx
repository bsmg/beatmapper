import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import { EditorActionPanel } from "$/components/app/templates/editor";
import { EditorBeatmapShortcuts } from "$/components/app/templates/shortcuts";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import { AmbientLight, Runway } from "$/components/scene/compositions";
import MapVisualization from "$/components/scene/templates/visualization";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization sid={sid} interactive />
				<AmbientLight />
				<Runway includeEdgeStrips />
				<fogExp2 attach="fog" args={[0x000000, 0.02]} />
			</ReduxForwardingCanvas>
			<EditorActionPanel sid={sid} />
			<EditorBeatmapShortcuts />
		</Fragment>
	);
}
