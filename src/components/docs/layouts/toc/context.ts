import { createContext, type Consumer as ReactConsumer } from "react";

interface ITocContext {
	activeHeadingId: string | null;
}

export const Context = createContext<ITocContext | null>(null);

export const Provider = Context.Provider;
export const Consumer = Context.Consumer as ReactConsumer<NonNullable<ITocContext>>;
