import { createFileRoute } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { Fragment } from "react/jsx-runtime";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import { SURFACE_WIDTH } from "$/components/scene/constants";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { getAppStore } from "$/setup";
import { useAppSelector } from "$/store/hooks";
import { selectBpm, selectJumpOffset, selectJumpSpeed, selectTimeProcessor } from "$/store/selectors";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const store = await getAppStore();
		const state = store.getState();

		const bpm = selectBpm(state, params.sid);
		const jumpSpeed = selectJumpSpeed(state, params.sid, params.bid);
		const jumpOffset = selectJumpOffset(state, params.sid, params.bid);

		const njs = NoteJumpSpeed.create(bpm, jumpSpeed, jumpOffset);

		return { njs, scale: bpm / 60 };
	},
});

function RouteComponent() {
	const { sid } = Route.useParams();
	const { njs, scale } = Route.useLoaderData();

	const timeProcessor = useAppSelector((state) => selectTimeProcessor(state, sid));

	const beatDepth = njs.calcDistance(scale);
	const surfaceDepth = njs.jd;
	const fudgeFactor = SURFACE_WIDTH / 2 - 1;

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization timescale={(time) => timeProcessor.toRealTime(time)} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={false} />
				<DefaultEnvironment surfaceDepth={surfaceDepth + fudgeFactor} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
