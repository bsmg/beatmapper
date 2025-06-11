import { ark } from "@ark-ui/react/factory";
import { Presence } from "@ark-ui/react/presence";
import { ArrowRightIcon, type LucideProps } from "lucide-react";
import { type ComponentProps, type ComponentType, useMemo } from "react";

import { css } from "$:styled-system/css";
import * as Builder from "../styled/list";
import type { VirtualColorPalette } from "../types";

const TYPES = { unordered: ark.ul, ordered: ark.ol } as const;

export interface ListRootProps extends ComponentProps<typeof Builder.Root> {
	type: "unordered" | "ordered";
	colorPalette?: VirtualColorPalette;
}
export function Root({ type, colorPalette = "blue", children, ...rest }: ListRootProps) {
	const context = useMemo(() => ({ variant: rest.variant }), [rest.variant]);
	const Element = useMemo(() => TYPES[type], [type]);

	return (
		<Builder.Provider value={context}>
			<Builder.Root asChild {...rest} className={css({ colorPalette })}>
				<Element>{children}</Element>
			</Builder.Root>
		</Builder.Provider>
	);
}

export interface ListItemProps extends ComponentProps<typeof Builder.Item> {
	indicator?: ComponentType<LucideProps>;
}
export function Item({ asChild, indicator: Indicator = ArrowRightIcon, children, ...rest }: ListItemProps) {
	return (
		<Builder.Item {...rest}>
			<Builder.Context>
				{(ctx) => (
					<Presence asChild present={ctx.variant === "plain"}>
						<Builder.Indicator asChild>
							<Indicator />
						</Builder.Indicator>
					</Presence>
				)}
			</Builder.Context>
			<ark.span asChild={asChild}>{children}</ark.span>
		</Builder.Item>
	);
}
