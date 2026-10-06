import { createContext, type ReactNode, useContext } from "react";

const SwitchContext = createContext<{ value: unknown; matched: boolean; setMatched: () => void } | null>(null);

interface MatchProps<T> {
	when: ((item: T) => boolean) | T | boolean | undefined | null;
	children: ReactNode | ((item: NonNullable<T>) => ReactNode);
}

export function Match<T>({ when, children }: MatchProps<T>) {
	const ctx = useContext(SwitchContext);
	if (!ctx) throw new Error("Match must be used within Switch");

	if (ctx.matched) return null;

	const isMatch = typeof when === "function" ? (when as (item: T) => boolean)(ctx.value as T) : when;

	if (isMatch) {
		ctx.setMatched();
		return typeof children === "function" ? children(ctx.value as NonNullable<T>) : children;
	}

	return null;
}

interface SwitchProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface SwitchRenderableProps<T> {
	value?: T;
	children: ReactNode | ((Matcher: typeof Match<T>) => ReactNode);
	fallback?: ReactNode;
}

export function Switch({ children, fallback }: SwitchProps): ReactNode;
export function Switch<T>({ value, children, fallback }: SwitchRenderableProps<T>): ReactNode;
export function Switch<T>({ value, children, fallback = null }: (SwitchProps & { value?: undefined }) | SwitchRenderableProps<T>) {
	let hasMatched = false;

	const contextValue = {
		value,
		get matched() {
			return hasMatched;
		},
		setMatched: () => {
			hasMatched = true;
		},
	};

	return (
		<SwitchContext.Provider value={contextValue}>
			{typeof children === "function" ? children(Match) : children}
			{!hasMatched ? fallback : null}
		</SwitchContext.Provider>
	);
}
