import { createContext } from "@ark-ui/react/utils";

export interface IVisualizationContext {
	cursorPositionInBeats: number;
	beatDepth: number;
	surfaceDepth: number;
	interactive: boolean;
}

export const [Provider, useVisualizationContext] = createContext<IVisualizationContext>();
