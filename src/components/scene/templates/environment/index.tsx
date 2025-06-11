import type { BeatmapId, SongId } from "$/types";

import { useControls } from "$/components/scene/hooks";

import { Environment } from "$/components/scene/layouts";
import BackLasers from "./back-lasers";
import LargeRings from "./large-rings";
import PrimaryLights from "./primary-lights";
import SideLasers from "./side-lasers";
import SmallRings from "./small-rings";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	surfaceDepth: number;
}
function DefaultEnvironment({ sid, bid, surfaceDepth }: Props) {
	useControls();

	return (
		<Environment.Root surfaceDepth={surfaceDepth}>
			<SideLasers sid={sid} bid={bid} side="left" />
			<SideLasers sid={sid} bid={bid} side="right" />
			<BackLasers sid={sid} bid={bid} />
			<LargeRings sid={sid} bid={bid} />
			<SmallRings sid={sid} />
			<PrimaryLights sid={sid} bid={bid} />
		</Environment.Root>
	);
}

export default DefaultEnvironment;
