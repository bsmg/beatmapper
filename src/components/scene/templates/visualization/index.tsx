import { Fragment } from "react";

import { SONG_OFFSET } from "$/components/scene/constants";
import { useControls } from "$/components/scene/hooks";
import type { BeatmapId, SongId } from "$/types";

import { TrackMover } from "$/components/scene/compositions";
import EditorBeatMarkers from "./markers";
import EditorNotes from "./notes";
import EditorObstacles from "./obstacles";
import EditorPlacementGrid from "./placement-grid";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
}
/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
function MapVisualization({ sid, bid, beatDepth, surfaceDepth, interactive }: Props) {
	useControls();

	return (
		<Fragment>
			<TrackMover sid={sid} beatDepth={beatDepth}>
				{interactive && <EditorBeatMarkers sid={sid} />}
				<EditorNotes sid={sid} bid={bid} beatDepth={beatDepth} surfaceDepth={surfaceDepth} />
				<EditorObstacles sid={sid} bid={bid} beatDepth={beatDepth} surfaceDepth={surfaceDepth} />
			</TrackMover>
			{interactive && <EditorPlacementGrid sid={sid} bid={bid} position-z={-SONG_OFFSET} />}
		</Fragment>
	);
}

export default MapVisualization;
