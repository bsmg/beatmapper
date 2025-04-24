import { ark } from "@ark-ui/react/factory";
import { Presence } from "@ark-ui/react/presence";
import { type ComponentProps, type MouseEventHandler, useCallback, useMemo } from "react";

import { css } from "$:styled-system/css";
import { Float } from "$:styled-system/jsx";
import { Button as Styled } from "../styled/button";
import type { VirtualColorPalette } from "../types";
import { Spinner } from "./spinner";

export interface ButtonProps extends ComponentProps<typeof Styled> {
	colorPalette?: VirtualColorPalette;
	loading?: boolean;
	unfocusOnClick?: boolean;
}
export function Button({ colorPalette: color, loading, onClick, unfocusOnClick, asChild, children, ...rest }: ButtonProps) {
	const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(event) => {
			if (unfocusOnClick) event.currentTarget.blur();
			if (onClick) onClick(event);
		},
		[onClick, unfocusOnClick],
	);

	const colorPalette = useMemo(() => {
		if (color) return color;
		if (rest.variant === "solid") return "pink";
		return "slate";
	}, [color, rest.variant]);

	return (
		<Styled disabled={rest.disabled || loading} data-loading={loading} onClick={handleClick} className={css({ colorPalette: colorPalette })} {...rest}>
			<ark.span asChild={asChild}>{children}</ark.span>
			<Presence asChild present={!!loading} lazyMount unmountOnExit>
				<Float placement={"middle-center"}>
					<Spinner size={16} />
				</Float>
			</Presence>
		</Styled>
	);
}
