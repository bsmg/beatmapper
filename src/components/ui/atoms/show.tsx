import { Fragment, type ReactNode } from "react";

interface ShowProps<T> {
	when: T | boolean | undefined | null;
	children: ReactNode | ((item: NonNullable<T>) => ReactNode);
	keyed?: boolean;
	fallback?: ReactNode;
}
export function Show<T>({ when, children, fallback = null, keyed }: ShowProps<T>) {
	if (!when) return fallback;

	if (typeof children === "function") {
		const content = children(when as NonNullable<T>);
		return keyed ? <Fragment key={JSON.stringify(when)}>{content}</Fragment> : content;
	}

	return children;
}
