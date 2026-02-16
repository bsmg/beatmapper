import type { Assign } from "@ark-ui/react";
import { type PropsWithChildren, useMemo } from "react";

import { type IVisualizationContext, Provider } from "./context";

function VisualizationRoot({ children, beatDepth, surfaceDepth, interactive }: Assign<PropsWithChildren, IVisualizationContext>) {
	const context = useMemo(() => ({ beatDepth, surfaceDepth, interactive }), [beatDepth, surfaceDepth, interactive]);

	return <Provider value={context}>{children}</Provider>;
}

export default VisualizationRoot;
