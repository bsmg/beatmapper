import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from "react";

const SwitchContext = createContext<{ value: unknown; claim: () => boolean } | null>(null);

interface MatchProps<T> {
	when: ((item: T) => boolean) | T | boolean | undefined | null;
	children: ReactNode | ((item: NonNullable<T>) => ReactNode);
}
export function Match<T>({ when, children }: MatchProps<T>) {
	const ctx = useContext(SwitchContext);
	if (!ctx) throw new Error("Match must be used within Switch");

	const isMatch = typeof when === "function" ? (when as (item: T) => boolean)(ctx.value as T) : when;

	if (isMatch && ctx.claim()) {
		return typeof children === "function" ? children(ctx.value as NonNullable<T>) : children;
	}

	return null;
}

function Fallback({ hasMatched, children }: { hasMatched: { current: boolean }; children: ReactNode }) {
	return !hasMatched.current ? children : null;
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
	const hasMatched = useRef(false);
	hasMatched.current = false;

	const claim = useCallback(() => {
		if (hasMatched.current) return false;
		hasMatched.current = true;
		return true;
	}, []);

	const contextValue = useMemo(() => ({ value, claim }), [value, claim]);

	return (
		<SwitchContext.Provider value={contextValue}>
			{typeof children === "function" ? children(Match) : children}
			<Fallback hasMatched={hasMatched}>{fallback}</Fallback>
		</SwitchContext.Provider>
	);
}
