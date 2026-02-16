import { createContext, type Consumer as ReactConsumer, useContext } from "react";

export interface IVisualizationContext {
	beatDepth: number;
	surfaceDepth: number;
	interactive: boolean;
}

export const Context = createContext<IVisualizationContext | null>(null);

export const Provider = Context.Provider;
export const Consumer = Context.Consumer as ReactConsumer<IVisualizationContext>;

export const useVisualizationContext = () => {
	const context = useContext(Context);
	if (!context) throw new Error("Missing provider.");
	return context;
};
