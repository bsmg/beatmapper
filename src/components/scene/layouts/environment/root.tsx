import { Fragment, type PropsWithChildren } from "react";

import { AmbientLight, Bloom, Runway } from "$/components/scene/compositions";

interface Props extends PropsWithChildren {
	surfaceDepth: number;
}
function EnvironmentRoot({ surfaceDepth, children }: Props) {
	return (
		<Fragment>
			<Bloom>{children}</Bloom>
			<Runway surfaceDepth={surfaceDepth} />
			<AmbientLight />
		</Fragment>
	);
}

export default EnvironmentRoot;
