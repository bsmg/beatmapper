import { createFileRoute } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { Fragment } from "react/jsx-runtime";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { getAppStore } from "$/setup";
import { selectBpm, selectJumpOffset, selectJumpSpeed } from "$/store/selectors";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const store = await getAppStore();
		const state = store.getState();

		const bpm = selectBpm(state, params.sid);
		const jumpSpeed = selectJumpSpeed(state, params.sid, params.bid);
		const jumpOffset = selectJumpOffset(state, params.sid, params.bid);

		const njs = NoteJumpSpeed.create(bpm, jumpSpeed, jumpOffset);

		return { beatDepth: jumpSpeed, surfaceDepth: njs.calcDistance(njs.hjd) };
	},
});

function RouteComponent() {
	const { beatDepth, surfaceDepth } = Route.useLoaderData();

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={false} />
				<DefaultEnvironment surfaceDepth={surfaceDepth} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
