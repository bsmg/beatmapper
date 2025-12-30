import { useControls } from "$/components/scene/hooks";
import { Environment } from "$/components/scene/layouts";
import BackLasers from "./back-lasers";
import LargeRings from "./large-rings";
import PrimaryLights from "./primary-lights";
import SideLasers from "./side-lasers";
import SmallRings from "./small-rings";

interface Props {
	surfaceDepth: number;
}
function DefaultEnvironment({ surfaceDepth }: Props) {
	useControls();

	return (
		<Environment.Root surfaceDepth={surfaceDepth}>
			<SideLasers side="left" />
			<SideLasers side="right" />
			<BackLasers />
			<LargeRings />
			<SmallRings />
			<PrimaryLights />
		</Environment.Root>
	);
}

export default DefaultEnvironment;
