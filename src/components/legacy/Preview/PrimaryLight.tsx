import { animated, useSpring } from "@react-spring/three";
import { Fragment } from "react";

import { useOnChange } from "$/components/hooks/use-on-change";
import { SURFACE_WIDTH } from "$/constants";
import { getColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectAllBasicEventsForTrack, selectCursorPositionInBeats, selectCustomColors, selectUsableAudioProcessingDelayInBeats } from "$/store/selectors";
import { App } from "$/types";
import { convertDegreesToRadians } from "$/utils";
import { findMostRecentEventInTrack, getSpringConfigForLight } from "./Preview.helpers";

import Glow from "./Glow";
import LaserBeam from "./LaserBeam";

const ON_PROPS = { emissiveIntensity: 0.75, opacity: 0.75 };
const OFF_PROPS = { emissiveIntensity: 0, opacity: 0 };
const BRIGHT_PROPS = { emissiveIntensity: 1, opacity: 1 };

interface Props {
	isPlaying: boolean;
	isBlooming?: boolean;
}

const PrimaryLight = ({ isPlaying, isBlooming }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const currentBeat = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	const processingDelayInBeats = useAppSelector((state) => selectUsableAudioProcessingDelayInBeats(state, songId));

	const lastEvent = useAppSelector((state) => {
		if (!songId || !currentBeat) return null;
		const events = selectAllBasicEventsForTrack(state, App.TrackId[4]);
		const lastEvent = findMostRecentEventInTrack<App.IBasicLightEvent>(events, currentBeat, processingDelayInBeats);
		return lastEvent;
	});

	// TODO: laser beams for along the side and maybe along the bottom too?
	const status = lastEvent ? lastEvent.type : App.BasicEventType.OFF;
	const lastEventId = lastEvent ? lastEvent.id : null;

	const color = status === App.BasicEventType.OFF ? "#000000" : getColorForItem(lastEvent?.colorType, customColors);

	const springConfig = getSpringConfigForLight([ON_PROPS, OFF_PROPS, BRIGHT_PROPS], status);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}

		const statusShouldReset = status === App.BasicEventType.FLASH || status === App.BasicEventType.FADE;

		springConfig.reset = statusShouldReset;
	}, lastEventId);

	const spring = useSpring(springConfig);

	const z = -85;

	const hatSideLength = 5;
	const hatThickness = 0.5;

	const yPosition = 5;

	const laserBeamLength = 250;

	return (
		<Fragment>
			<group position={[0, yPosition, z]} rotation={[0, 0, -Math.PI * 0.25]}>
				<mesh position={[0, hatSideLength / 2 + hatThickness / 2, 0]}>
					<boxGeometry attach="geometry" args={[hatSideLength, hatThickness, hatThickness]} />
					<animated.meshLambertMaterial attach="material" emissive={color} transparent {...spring} />
				</mesh>
				<mesh position={[-hatSideLength / 2 + hatThickness / 2, hatThickness / 2, 0]} rotation={[0, 0, Math.PI * 0.5]}>
					<boxGeometry attach="geometry" args={[hatSideLength - hatThickness, hatThickness, hatThickness]} />
					<animated.meshLambertMaterial attach="material" emissive={color} transparent {...spring} />
				</mesh>
			</group>

			{/* Side parallel-to-platform lasers */}
			<LaserBeam color={color} position={[SURFACE_WIDTH - 2, -2, -laserBeamLength / 2 - 5]} rotation={[convertDegreesToRadians(90), 0, 0]} lastEventId={lastEventId} status={status} isPlaying={isPlaying} length={laserBeamLength} radius={0.08} />
			<LaserBeam color={color} position={[-SURFACE_WIDTH + 2, -2, -laserBeamLength / 2 - 5]} rotation={[convertDegreesToRadians(90), 0, 0]} lastEventId={lastEventId} status={status} isPlaying={isPlaying} length={laserBeamLength} radius={0.08} />

			<Glow color={color} x={0} y={yPosition} z={z} size={40} status={status} lastEventId={lastEvent ? lastEvent.id : null} isPlaying={isPlaying} isBlooming={isBlooming} />
		</Fragment>
	);
};

export default PrimaryLight;
