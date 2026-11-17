import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import { useNoteJumpSpeed } from "$/components/app/hooks/use-note-jump-speed.hook";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import { Controls } from "$/components/scene/templates/controls";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { useAppSelector } from "$/store/hooks";
import { selectTimeProcessor } from "$/store/selectors";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();

	const timeProcessor = useAppSelector((state) => selectTimeProcessor(state, sid));

	const { beatDepth, surfaceDepth } = useNoteJumpSpeed();

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization timescale={(time) => timeProcessor.toRealTime(time)} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={false} />
				<DefaultEnvironment surfaceDepth={surfaceDepth} />
				<Controls />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
