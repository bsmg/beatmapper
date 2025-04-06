import { type PropsWithoutRef, forwardRef } from "react";

import { Icon } from "../ui/styled/icon";

interface CreateIconOptions<T extends {}> {
	viewBox?: string;
	path: (props: PropsWithoutRef<T>) => React.ReactElement;
	d?: string;
	displayName?: string;
	defaultProps?: T;
}
export function createIcon<T extends {}>({ viewBox = "0 0 24 24", d, displayName, defaultProps = {} as T, ...rest }: CreateIconOptions<T>) {
	const Element = forwardRef<SVGSVGElement, T>((props, ref) => (
		<Icon ref={ref} asChild={false} viewBox={viewBox} {...defaultProps} {...props}>
			{rest.path(props)}
		</Icon>
	));
	Element.displayName = displayName;
	return Element;
}
