import { Environment } from "$/components/scene/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled, selectRotationLane } from "$/store/selectors";
import { convertDegreesToRadians } from "$/utils";
import BackLasers from "./back-lasers";
import LargeRings from "./large-rings";
import PrimaryLights from "./primary-lights";
import SideLasers from "./side-lasers";
import SmallRings from "./small-rings";

interface Props {
	surfaceDepth: number;
}
function DefaultEnvironment({ surfaceDepth }: Props) {
	const isBloomEnabled = useAppSelector(selectBloomEnabled);
	const rotationLane = useAppSelector(selectRotationLane);

	return (
		<Environment.Root surfaceDepth={surfaceDepth} isBloomEnabled={isBloomEnabled} rotation-y={convertDegreesToRadians(rotationLane)}>
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
