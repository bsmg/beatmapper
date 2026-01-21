import { ark } from "@ark-ui/react/factory";
import { Presence } from "@ark-ui/react/presence";
import { type ComponentProps, type KeyboardEvent, type MouseEvent, useCallback, useMemo } from "react";

import { Button as Styled } from "$/components/ui/styled/button";
import { css } from "$:styled-system/css";
import { Float } from "$:styled-system/jsx";
import type { SystemStyleObject } from "$:styled-system/types";
import { Spinner } from "./spinner";

export interface ButtonProps extends ComponentProps<typeof Styled>, Pick<SystemStyleObject, "colorPalette"> {
	loading?: boolean;
	unfocusOnClick?: boolean;
}
export function Button({ colorPalette: color, loading, unfocusOnClick, asChild, children, ...rest }: ButtonProps) {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	const colorPalette = useMemo(() => {
		if (color) return color;
		if (rest.variant === "solid") return "pink";
		return "slate";
	}, [color, rest.variant]);

	return (
		<Styled disabled={rest.disabled || loading} data-loading={loading} onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus} className={css({ colorPalette: colorPalette })} {...rest}>
			<ark.span asChild={asChild}>{children}</ark.span>
			<Presence asChild present={!!loading} lazyMount unmountOnExit>
				<Float placement={"middle-center"}>
					<Spinner size={16} />
				</Float>
			</Presence>
		</Styled>
	);
}
