import type { Assign } from "@ark-ui/react";
import { ark } from "@ark-ui/react/factory";
import { useStore } from "@tanstack/react-form";
import { type ComponentProps, type MouseEvent, useCallback, useMemo } from "react";

import { Show } from "$/components/ui/atoms";
import { useFormContext } from "$/components/ui/hooks/form.hooks";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import { Button as Styled } from "$/components/ui/styled/button";
import { css, cx } from "$:styled-system/css";
import { Float } from "$:styled-system/jsx";
import type { SystemStyleObject } from "$:styled-system/types";
import { Spinner } from "./spinner";

export interface ButtonProps extends UseInteractableOptions, Pick<SystemStyleObject, "colorPalette"> {
	loading?: boolean;
}

export function Button({ children, className, disabled, loading, unfocusOnPress, colorPalette: overrideColorPalette, ...rest }: Assign<ComponentProps<typeof Styled>, ButtonProps>) {
	const Text = useRender(ark.span, toPolymorphic("span"));

	const { handlePress } = useInteractable({ unfocusOnPress });

	const colorPalette = useMemo(() => overrideColorPalette ?? (rest.variant === "solid" ? "pink" : "slate"), [overrideColorPalette, rest.variant]);

	return (
		<Styled {...rest} disabled={disabled || loading} aria-busy={loading} onClickCapture={handlePress} onKeyDownCapture={handlePress} className={cx(css({ colorPalette }), className)}>
			<Text>{children}</Text>
			<Show when={loading}>
				<Float as={"span"} placement={"middle-center"}>
					<Spinner size={16} />
				</Float>
			</Show>
		</Styled>
	);
}

export function SubmitButton({ children, onClick, disabled, loading, ...rest }: ComponentProps<typeof Button>) {
	const form = useFormContext();

	const isDisabled = useStore(form.store, (state) => disabled || !state.canSubmit);
	const isLoading = useStore(form.store, (state) => loading || state.isSubmitting);

	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			form.handleSubmit();
			if (onClick) onClick(event);
		},
		[onClick, form.handleSubmit],
	);

	return (
		<Button variant="solid" size="md" onClick={handleClick} {...rest} loading={isLoading} disabled={isDisabled}>
			{children ?? "Submit"}
		</Button>
	);
}
