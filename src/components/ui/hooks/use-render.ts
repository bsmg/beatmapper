import type { PolymorphicProps } from "@ark-ui/react/factory";
import { Children, type ComponentPropsWithoutRef, createElement, type ElementType, isValidElement, type PropsWithChildren, type ReactNode, useCallback } from "react";

export function useRender<TElement extends ElementType>(Component: TElement, renderFn: (props: ComponentPropsWithoutRef<TElement>) => ComponentPropsWithoutRef<TElement>) {
	return useCallback((ownProps: ComponentPropsWithoutRef<TElement>) => createElement(Component, renderFn(ownProps)), [Component, renderFn]);
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
