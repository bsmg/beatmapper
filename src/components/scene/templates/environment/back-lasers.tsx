import { useLightEffect } from "$/components/scene/hooks/environment.hooks";
import { useBasicEventTrack } from "$/components/scene/hooks/use-event-track";
import { Environment } from "$/components/scene/layouts";
import { range } from "$/utils";

const sides = ["left", "right"];

const NUM_OF_BEAMS_PER_SIDE = 5;
const DISTANCE_BETWEEN_BEAMS = 25;

function BackLasers() {
	const [lastEvent] = useBasicEventTrack({ trackId: 0 });

	const light = useLightEffect({ lastEvent });

	return sides.map((side) => {
		return Array.from(range(0, NUM_OF_BEAMS_PER_SIDE)).map((index) => {
			return <Environment.TubeLight key={`${side}-${index}`} light={light} radius={0.25} position-y={-40} position-z={-140 + index * -DISTANCE_BETWEEN_BEAMS} rotation-z={side === "right" ? -0.45 : 0.45} />;
		});
	});
}

export default BackLasers;
