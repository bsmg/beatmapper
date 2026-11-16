import type { Assign } from "@ark-ui/react";
import { type ComponentProps, useMemo } from "react";

import { type IVisualizationContext, Provider } from "./context";

function VisualizationRoot({ cursorPosition, timescale, beatDepth, surfaceDepth, interactive, children, ...rest }: Assign<ComponentProps<"group">, IVisualizationContext>) {
	const value = useMemo(() => {
		return { cursorPosition, timescale, beatDepth, surfaceDepth, interactive };
	}, [cursorPosition, timescale, beatDepth, surfaceDepth, interactive]);

	return (
		<Provider value={value}>
			<group {...rest}>{children}</group>
		</Provider>
	);
}

export default VisualizationRoot;
