import { ark } from "@ark-ui/react/factory";
import { ArrowRightIcon, type LucideProps } from "lucide-react";
import { type ComponentProps, type ComponentType, useMemo } from "react";

import { Show } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/list";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

const TYPES = { unordered: ark.ul, ordered: ark.ol } as const;

export interface ListRootProps extends ComponentProps<typeof Builder.Root>, Pick<SystemStyleObject, "colorPalette"> {
	type: "unordered" | "ordered";
}
export function Root({ type, colorPalette = "blue", children, ...rest }: ListRootProps) {
	const context = useMemo(() => ({ variant: rest.variant }), [rest.variant]);

	const Element = useMemo(() => TYPES[type], [type]);

	return (
		<Builder.Provider value={context}>
			<Builder.Root as={Element} {...rest} className={css({ colorPalette })}>
				{children}
			</Builder.Root>
		</Builder.Provider>
	);
}

export interface ListItemProps extends ComponentProps<typeof Builder.Item> {
	indicator?: ComponentType<LucideProps>;
}
export function Item({ indicator: Indicator = ArrowRightIcon, children, ...rest }: ListItemProps) {
	return (
		<Builder.Item {...rest}>
			<Builder.Context>
				{(ctx) => (
					<Show when={ctx.variant === "plain"}>
						<Builder.Indicator>
							<Indicator />
						</Builder.Indicator>
					</Show>
				)}
			</Builder.Context>
			{children}
		</Builder.Item>
	);
}
