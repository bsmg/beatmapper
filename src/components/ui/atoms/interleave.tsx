import { Children, type PropsWithChildren, type ReactNode } from "react";

interface Props extends PropsWithChildren {
	separator: (props: { index: number; length: number }) => ReactNode;
}
export function Interleave({ children, separator }: Props) {
	const length = Children.count(children);
	return Children.map(children, (child, index) => [child, index < length - 1 && separator({ index, length })]);
}
