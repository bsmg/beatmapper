import { Fragment, type PropsWithChildren, useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality } from "$/store/selectors";
import { Quality } from "$/types";

import { AmbientLight, Bloom, NoBloom } from "$/components/scene/compositions";
import Runway from "$/components/scene/compositions/environment/runway";
import { useControls } from "$/components/scene/hooks";

function EnvironmentRoot({ children }: PropsWithChildren) {
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const isBlooming = useMemo(() => graphicsLevel === Quality.HIGH, [graphicsLevel]);

	useControls();

	const environment = (
		<Fragment>
			<Runway />
			<AmbientLight />
		</Fragment>
	);

	return (
		<Fragment>
			{isBlooming ? <Bloom>{children}</Bloom> : children}
			{isBlooming ? <NoBloom>{environment}</NoBloom> : environment}
		</Fragment>
	);
}

export default EnvironmentRoot;
