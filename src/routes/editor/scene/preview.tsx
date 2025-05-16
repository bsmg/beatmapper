import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Fragment } from "react/jsx-runtime";

import { useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectSongById } from "$/store/selectors";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { NoteJumpSpeed } from "bsmap";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const song = useAppSelector((state) => selectSongById(state, sid));
	const beatmap = useAppSelector((state) => selectBeatmapById(state, sid, bid));
	const njs = useRef(NoteJumpSpeed.create(song.bpm, beatmap.noteJumpSpeed, beatmap.startBeatOffset));

	const surfaceDepth = useMemo(() => beatmap.noteJumpSpeed * njs.current.calcHjd(), [beatmap.noteJumpSpeed]);

	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<MapVisualization sid={sid} bid={bid} beatDepth={beatmap.noteJumpSpeed} surfaceDepth={surfaceDepth} />
				<DefaultEnvironment sid={sid} bid={bid} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
