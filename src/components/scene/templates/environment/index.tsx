import { useControls } from "$/components/scene/hooks/use-controls";
import { Environment } from "$/components/scene/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled } from "$/store/selectors";
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

	const isBloomEnabled = useAppSelector(selectBloomEnabled);

	return (
		<Environment.Root surfaceDepth={surfaceDepth} isBloomEnabled={isBloomEnabled}>
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
