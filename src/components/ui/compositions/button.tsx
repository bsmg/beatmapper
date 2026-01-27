import { ark } from "@ark-ui/react/factory";
import { Presence } from "@ark-ui/react/presence";
import { type ComponentProps, useMemo } from "react";

import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import { Button as Styled } from "$/components/ui/styled/button";
import { css } from "$:styled-system/css";
import { Float } from "$:styled-system/jsx";
import type { SystemStyleObject } from "$:styled-system/types";
import { Spinner } from "./spinner";

export interface ButtonProps extends ComponentProps<typeof Styled>, UseInteractableOptions, Pick<SystemStyleObject, "colorPalette"> {
	loading?: boolean;
}
export function Button({ colorPalette: color, loading, unfocusOnPress, asChild, children, ...rest }: ButtonProps) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	const colorPalette = useMemo(() => {
		if (color) return color;
		if (rest.variant === "solid") return "pink";
		return "slate";
	}, [color, rest.variant]);

	return (
		<Styled disabled={rest.disabled || loading} aria-busy={loading} onClickCapture={handlePress} onKeyDownCapture={handlePress} className={css({ colorPalette: colorPalette })} {...rest}>
			<ark.span asChild={asChild}>{children}</ark.span>
			<Presence asChild present={!!loading} lazyMount unmountOnExit>
				<Float placement={"middle-center"}>
					<Spinner size={16} />
				</Float>
			</Presence>
		</Styled>
	);
}
