import { Fragment, type PropsWithChildren } from "react";

import { AmbientLight, Bloom, Runway } from "$/components/scene/compositions";

interface Props extends PropsWithChildren {
	surfaceDepth: number;
	isBloomEnabled?: boolean;
}
function EnvironmentRoot({ surfaceDepth, isBloomEnabled, children }: Props) {
	return (
		<Fragment>
			<Bloom enabled={isBloomEnabled}>{children}</Bloom>
			<Runway surfaceDepth={surfaceDepth} />
			<AmbientLight />
		</Fragment>
	);
}

export default EnvironmentRoot;
