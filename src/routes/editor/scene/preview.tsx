import { createFileRoute } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { Fragment } from "react/jsx-runtime";

import { selectBeatmapById, selectSongById } from "$/store/selectors";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { store } from "$/setup";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
	loader: ({ params }) => {
		const state = store.getState();
		const { sid, bid } = params;

		const song = selectSongById(state, sid);
		const beatmap = selectBeatmapById(state, sid, bid);

		const njs = NoteJumpSpeed.create(song.bpm, beatmap.noteJumpSpeed, beatmap.startBeatOffset);

		const jumpSpeed = beatmap.noteJumpSpeed;
		const jumpOffset = beatmap.noteJumpSpeed * njs.calcHjd();

		return { jumpSpeed, jumpOffset };
	},
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const { jumpSpeed, jumpOffset } = Route.useLoaderData();

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization sid={sid} bid={bid} beatDepth={jumpSpeed} surfaceDepth={jumpOffset} interactive={false} />
				<DefaultEnvironment sid={sid} bid={bid} surfaceDepth={jumpOffset} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
