import { Fragment, type PropsWithChildren } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled } from "$/store/selectors";

import { AmbientLight, Bloom, NoBloom } from "$/components/scene/compositions";
import Runway from "$/components/scene/compositions/environment/runway";
import { useControls } from "$/components/scene/hooks";

interface Props extends PropsWithChildren {
	surfaceDepth: number;
}
function EnvironmentRoot({ surfaceDepth, children }: Props) {
	const isBloomEnabled = useAppSelector(selectBloomEnabled);

	useControls();

	const environment = (
		<Fragment>
			<Runway surfaceDepth={surfaceDepth} />
			<AmbientLight />
		</Fragment>
	);

	return (
		<Fragment>
			{isBloomEnabled ? <Bloom>{children}</Bloom> : children}
			{isBloomEnabled ? <NoBloom>{environment}</NoBloom> : environment}
		</Fragment>
	);
}

export default EnvironmentRoot;
