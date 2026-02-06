import type { PolymorphicProps } from "@ark-ui/react/factory";
import { Children, type ComponentPropsWithoutRef, createElement, type ElementType, isValidElement, type PropsWithChildren, type ReactNode, useMemo, useRef } from "react";

export function useRender<TElement extends ElementType>(Component: TElement, renderFn: (props: ComponentPropsWithoutRef<TElement>) => ComponentPropsWithoutRef<TElement>) {
	const ref = useRef(renderFn);

	return useMemo(() => {
		return (ownProps: ComponentPropsWithoutRef<TElement>) => {
			const transformedProps = ref.current(ownProps);
			return createElement(Component, transformedProps);
		};
	}, [Component]);
}

export function toPolymorphic<TElement extends ElementType>(as: TElement, render?: (Element: TElement, props: ComponentPropsWithoutRef<TElement>) => ReactNode) {
	return <Props extends PropsWithChildren<PolymorphicProps>>(ownProps: Props): Props => {
		const { children, ...rest } = ownProps;

		return {
			...rest,
			asChild: !!as || (Children.count(children) === 1 && isValidElement(children)),
			children: render ? render(as, ownProps as ComponentPropsWithoutRef<TElement>) : createElement(as, ownProps),
		} as Props;
	};
}
