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
	interactive?: boolean;
}
/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
function MapVisualization({ sid, bid, interactive }: Props) {
	useControls();

	return (
		<Fragment>
			<TrackMover sid={sid}>
				{interactive && <EditorBeatMarkers sid={sid} />}
				<EditorNotes sid={sid} bid={bid} />
				<EditorObstacles sid={sid} bid={bid} />
			</TrackMover>
			{interactive && <EditorPlacementGrid sid={sid} bid={bid} position-z={-SONG_OFFSET} />}
		</Fragment>
	);
}

export default MapVisualization;
