import type { SongId } from "$/types";

import { useControls } from "$/components/scene/hooks";
import { Environment } from "$/components/scene/layouts";
import BackLasers from "./back-lasers";
import LargeRings from "./large-rings";
import PrimaryLights from "./primary-lights";
import SideLasers from "./side-lasers";
import SmallRings from "./small-rings";

interface Props {
	sid: SongId;
}
function DefaultEnvironment({ sid }: Props) {
	useControls();

	return (
		<Environment.Root>
			<SideLasers sid={sid} side="left" />
			<SideLasers sid={sid} side="right" />
			<BackLasers sid={sid} />
			<LargeRings sid={sid} />
			<SmallRings sid={sid} />
			<PrimaryLights sid={sid} />
		</Environment.Root>
	);
}

export default DefaultEnvironment;
