import { useFrame } from "@react-three/fiber";
import { Fragment, useRef } from "react";

import { Controls } from "$/services/controls.service";
import { useAppSelector } from "$/store/hooks";
import { selectEventEditorTogglePreview, selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import type { Quality } from "$/types";

import AmbientLighting from "../Preview/AmbientLighting";
import BackLaser from "../Preview/BackLaser";
import LargeRings from "../Preview/LargeRings";
import PrimaryLight from "../Preview/PrimaryLight";
import SideLaser from "../Preview/SideLaser";
import SmallRings from "../Preview/SmallRings";
import ReduxForwardingCanvas from "../ReduxForwardingCanvas";
import StaticEnvironment from "../StaticEnvironment";

interface Props {
	isPlaying: boolean;
	graphicsLevel: Quality;
}

const EventLightingPreviewPresentational = ({ isPlaying }: Props) => {
	const controls = useRef<Controls | null>(null);

	// Controls to move around the space.
	useFrame(({ scene, camera }) => {
		if (!controls.current) {
			controls.current = new Controls(camera, [0, -1, 0]);
			scene.add(controls.current.getObject());
		} else {
			controls.current.update();
		}
	});

	const lights = (
		<Fragment>
			<SideLaser isPlaying={isPlaying} side="left" />
			<SideLaser isPlaying={isPlaying} side="right" />
			<BackLaser isPlaying={isPlaying} />
			<LargeRings isPlaying={isPlaying} />
			<SmallRings isPlaying={isPlaying} />
			<PrimaryLight isPlaying={isPlaying} />
		</Fragment>
	);

	const environment = (
		<Fragment>
			<StaticEnvironment />
			<AmbientLighting includeSpotlight />
		</Fragment>
	);

	return (
		<Fragment>
			{lights}
			{environment}
		</Fragment>
	);
};

/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
const EventLightingPreview = () => {
	const isPlaying = useAppSelector(selectIsPlaying);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);
	const showLightingPreview = useAppSelector(selectEventEditorTogglePreview);

	if (!showLightingPreview) {
		return null;
	}

	return (
		<ReduxForwardingCanvas>
			<EventLightingPreviewPresentational isPlaying={isPlaying} graphicsLevel={graphicsLevel} />
		</ReduxForwardingCanvas>
	);
};

export default EventLightingPreview;
