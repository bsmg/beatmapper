import type { Assign } from "@ark-ui/react";
import type { ComponentProps } from "react";

import { AmbientLight, Bloom, Runway } from "$/components/scene/compositions";

interface Props {
	surfaceDepth: number;
	isBloomEnabled?: boolean;
}
function EnvironmentRoot({ surfaceDepth, isBloomEnabled, children, ...rest }: Assign<ComponentProps<"group">, Props>) {
	return (
		<group {...rest}>
			<Bloom enabled={isBloomEnabled}>{children}</Bloom>
			<Runway surfaceDepth={surfaceDepth} />
			<AmbientLight />
		</group>
	);
}

export default EnvironmentRoot;
