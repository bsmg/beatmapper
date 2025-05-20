import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import { EditorActionPanel } from "$/components/app/templates/editor";
import { NotesEditorShortcuts } from "$/components/app/templates/shortcuts";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import { AmbientLight, Runway } from "$/components/scene/compositions";
import MapVisualization from "$/components/scene/templates/visualization";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectSurfaceDepth } from "$/store/selectors";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const beatDepth = useAppSelector(selectBeatDepth);
	const surfaceDepth = useAppSelector(selectSurfaceDepth);

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization sid={sid} bid={bid} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive />
				<AmbientLight />
				<Runway includeEdgeStrips />
				<fogExp2 attach="fog" args={[0x000000, 0.02]} />
			</ReduxForwardingCanvas>
			<EditorActionPanel sid={sid} bid={bid} />
			<NotesEditorShortcuts sid={sid} />
		</Fragment>
	);
}
