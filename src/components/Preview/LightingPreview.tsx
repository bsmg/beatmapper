import { useFrame } from "@react-three/fiber";
import { Fragment, useRef } from "react";

import { Controls } from "$/services/controls.service";
import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import { Quality } from "$/types";

import { Bloom, NoBloom } from "../BloomEffect";
import Fog from "../Fog";
import StaticEnvironment from "../StaticEnvironment";
import AmbientLighting from "./AmbientLighting";
import BackLaser from "./BackLaser";
import LargeRings from "./LargeRings";
import PrimaryLight from "./PrimaryLight";
import SideLaser from "./SideLaser";
import SmallRings from "./SmallRings";

/**
 * This component holds all of the internal 3D stuff, everything you see in the main part of the map editor.
 *
 * It does NOT include the 2D stuff like the toolbar or the track controls.
 */
const LightingPreview = () => {
	const isPlaying = useAppSelector(selectIsPlaying);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const controls = useRef<Controls | null>(null);

	const isBlooming = graphicsLevel === Quality.HIGH;

	// Controls to move around the space.
	useFrame(({ scene, camera }) => {
		if (!controls.current) {
			controls.current = new Controls(camera);
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
			<PrimaryLight isPlaying={isPlaying} isBlooming={isBlooming} />
		</Fragment>
	);

	const environment = (
		<Fragment>
			<StaticEnvironment />
			<AmbientLighting includeSpotlight />
		</Fragment>
	);

	if (isBlooming) {
		return (
			<Fragment>
				<Bloom>{lights}</Bloom>

				<NoBloom>{environment}</NoBloom>
			</Fragment>
		);
	}

	return (
		<Fragment>
			{lights}
			{environment}
			<Fog renderForGraphics={Quality.MEDIUM} strength={0.005} />
		</Fragment>
	);
};

export default LightingPreview;
