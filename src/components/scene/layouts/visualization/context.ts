import { createContext } from "@ark-ui/react/utils";

export interface IVisualizationContext {
	cursorPosition: number;
	timescale: (time: number) => number;
	beatDepth: number;
	surfaceDepth: number;
	interactive: boolean;
}

export const [Provider, useVisualizationContext] = createContext<IVisualizationContext>();
