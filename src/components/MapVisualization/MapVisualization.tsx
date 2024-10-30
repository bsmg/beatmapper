import { useFrame } from "@react-three/fiber";
import { Fragment, useRef } from "react";

import { BLOCK_COLUMN_WIDTH, GRID_POSITION } from "$/constants";
import { Controls } from "$/services/controls.service";
import { Quality } from "$/types";

import BarMarkers from "../BarMarkers";
import Fog from "../Fog";
import Obstacles from "../Obstacles";
import PlacementGrid from "../PlacementGrid";
import SongBlocks from "../SongBlocks";
import StaticEnvironment from "../StaticEnvironment";
import TrackMover from "../TrackMover";
import Lighting from "./Lighting";

/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
const MapVisualization = () => {
	const controls = useRef<Controls | null>(null);

	// Controls to move around the space.
	useFrame(({ scene, camera }) => {
		if (!controls.current) {
			controls.current = new Controls(camera);
			scene.add(controls.current.getObject());
		} else {
			controls.current.update();
		}
	});

	return (
		<Fragment>
			<StaticEnvironment includeEdgeStrips trackGridRows={true} />

			<Fog renderForGraphics={Quality.HIGH} strength={0.02} />

			<Lighting />

			<TrackMover>
				<SongBlocks />
				<BarMarkers />
				<Obstacles />
			</TrackMover>

			<PlacementGrid width={BLOCK_COLUMN_WIDTH * 4} height={BLOCK_COLUMN_WIDTH * 3} gridPosition={GRID_POSITION} />
		</Fragment>
	);
};

export default MapVisualization;
