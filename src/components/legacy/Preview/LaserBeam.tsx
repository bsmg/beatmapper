import { animated, useSpring } from "@react-spring/three";
import type { ColorRepresentation, Vector3Tuple } from "three";

import { useOnChange } from "$/components/hooks";
import { App } from "$/types";
import { getSpringConfigForLight } from "./Preview.helpers";

const ON_PROPS = { emissiveIntensity: 0.75, opacity: 0.75 };
const OFF_PROPS = { emissiveIntensity: 0, opacity: 0 };
const BRIGHT_PROPS = { emissiveIntensity: 1, opacity: 1 };

interface Props {
	color: ColorRepresentation;
	position: Vector3Tuple;
	rotation: Vector3Tuple;
	brightness?: number;
	status: App.LightEventType;
	lastEventId: App.BasicEvent["id"] | null;
	isPlaying: boolean;
	length?: number;
	radius?: number;
}

const LaserBeam = ({ color, position, rotation, status, lastEventId, isPlaying, length = 500, radius = 0.35 }: Props) => {
	// ~~Complicated Business~~
	// This component renders super often, since its `rotation` can change on every frame.
	//
	// When certain statuses occur - flash, fade - we want to reset the spring, so that it does the "from" and "to" again.
	// This should happen even when the status hasn't changed (eg. a series of `flash` events in a row should all trigger the reset, and get momentarily brighter).
	//
	// If I just set `reset: true` based on the status, though, then it resets _on every frame_, meaning that the value is just perpetually locked to the `from` value.
	// So I need to let a single render pass when `reset` is true.
	//
	// I cache the event ID so that I can distinguish the first render after it changes.
	// When that happens, I set `reset` to true and update the cache, so that the next render sets it back to `false`.
	//
	// This feels hacky, but I don't know of a better way.
	const springConfig = getSpringConfigForLight([ON_PROPS, OFF_PROPS, BRIGHT_PROPS], status);

	useOnChange(() => {
		if (!isPlaying) {
			return;
		}

		const statusShouldReset = status === App.BasicEventType.FLASH || status === App.BasicEventType.FADE;

		springConfig.reset = statusShouldReset;
	}, lastEventId);

	const spring = useSpring(springConfig);

	return (
		<group>
			<mesh position={position} rotation={rotation}>
				<cylinderGeometry attach="geometry" args={[radius, radius, length]} />
				<animated.meshLambertMaterial attach="material" emissive={color} transparent={true} {...spring} />
			</mesh>
		</group>
	);
};

export default LaserBeam;
