import { type ComponentType, type ElementType, createContext, forwardRef, useContext } from "react";

import { cx } from "$:styled-system/css";
import { type StyledComponent, isCssProperty, styled } from "$:styled-system/jsx";
import type { RecipeSelection, SlotRecipeRuntimeFn, SlotRecipeVariantRecord } from "$:styled-system/types";

type Options = { forwardProps?: string[] };

function shouldForwardProp(prop: string, variantKeys: string[], options: Options = {}) {
	return options.forwardProps?.includes(prop) || (!variantKeys.includes(prop) && !isCssProperty(prop));
}

export function createStyleContext<S extends string, R extends SlotRecipeVariantRecord<S>>(recipe: SlotRecipeRuntimeFn<S, R>) {
	const StyleContext = createContext<Record<S, string> | null>(null);

	function withRootProvider<P extends {}>(Component: ComponentType<P>) {
		const StyledComponent = (props: P) => {
			const [variantProps, otherProps] = recipe.splitVariantProps(props) as unknown as [RecipeSelection<R>, P];
			const slotStyles = recipe(variantProps) as Record<S, string>;
			return (
				<StyleContext.Provider value={slotStyles}>
					<Component {...otherProps} />
				</StyleContext.Provider>
			);
		};
		return StyledComponent;
	}

	function withProvider<P extends { className?: string | undefined }>(Component: ComponentType<P>, slot: S, options?: Options) {
		const StyledComponent = styled(Component, {}, { shouldForwardProp: (prop, variantKeys) => shouldForwardProp(prop, variantKeys, options) }) as StyledComponent<ElementType>;
		const StyledSlotProvider = forwardRef<ComponentType<P>, RecipeSelection<R> & P>((props, ref) => {
			const [variantProps, otherProps] = recipe.splitVariantProps(props as RecipeSelection<R>) as unknown as [RecipeSelection<R>, P];
			const slotStyles = recipe(variantProps) as Record<S, string>;
			return (
				<StyleContext.Provider value={slotStyles}>
					<StyledComponent {...otherProps} ref={ref} className={cx(slotStyles?.[slot], otherProps.className)} />
				</StyleContext.Provider>
			);
		});
		StyledSlotProvider.displayName = Component.displayName || Component.name;
		return StyledSlotProvider;
	}

	function withContext<P extends { className?: string | undefined }>(Component: ComponentType<P>, slot: S) {
		const StyledComponent = styled(Component) as StyledComponent<ElementType>;
		const StyledSlotComponent = forwardRef<ComponentType<P>, P>((props, ref) => {
			const slotStyles = useContext(StyleContext);
			return <StyledComponent {...props} ref={ref} className={cx(slotStyles?.[slot], props.className)} />;
		});
		StyledSlotComponent.displayName = Component.displayName || Component.name;

		return StyledSlotComponent;
	}

	return { withRootProvider, withProvider, withContext };
}
