import type { Assign } from "@ark-ui/react";
import type { PropsWithChildren } from "react";

import { type IVisualizationContext, Provider } from "./context";

function VisualizationRoot({ children, ...rest }: Assign<PropsWithChildren, IVisualizationContext>) {
	return <Provider value={rest}>{children}</Provider>;
}

export default VisualizationRoot;
