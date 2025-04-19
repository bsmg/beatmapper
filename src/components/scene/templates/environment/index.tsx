import type { SongId } from "$/types";

import { useControls } from "$/components/scene/hooks";
import { Environment } from "$/components/scene/layouts";
import BackLaser from "./back-lasers";
import LargeRings from "./large-rings";
import PrimaryLight from "./primary-lights";
import SideLaser from "./side-lasers";
import SmallRings from "./small-rings";

interface Props {
	sid: SongId;
}
function LightingPreview({ sid }: Props) {
	useControls();

	return (
		<Environment.Root>
			<SideLaser sid={sid} side="left" />
			<SideLaser sid={sid} side="right" />
			<BackLaser sid={sid} />
			<LargeRings sid={sid} />
			<SmallRings sid={sid} />
			<PrimaryLight sid={sid} />
		</Environment.Root>
	);
}

export default LightingPreview;
