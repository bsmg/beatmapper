import { createFileRoute } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { Fragment } from "react/jsx-runtime";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { getAppStore } from "$/setup";
import { selectBeatmapById, selectSongById } from "$/store/selectors";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const store = await getAppStore();
		const state = store.getState();

		const song = selectSongById(state, params.sid);
		const beatmap = selectBeatmapById(state, params.sid, params.bid);

		const njs = NoteJumpSpeed.create(song.bpm, beatmap.noteJumpSpeed, beatmap.startBeatOffset);

		const jumpSpeed = beatmap.noteJumpSpeed;
		const jumpOffset = beatmap.noteJumpSpeed * njs.calcHjd();

		return { jumpSpeed, jumpOffset };
	},
});

function RouteComponent() {
	const { jumpSpeed, jumpOffset } = Route.useLoaderData();

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization beatDepth={jumpSpeed} surfaceDepth={jumpOffset} interactive={false} />
				<DefaultEnvironment surfaceDepth={jumpOffset} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
