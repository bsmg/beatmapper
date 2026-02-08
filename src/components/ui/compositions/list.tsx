import type { Assign } from "@ark-ui/react";
import { ark } from "@ark-ui/react/factory";
import { ArrowRightIcon, type LucideProps } from "lucide-react";
import { type ComponentProps, type ComponentType, useMemo } from "react";

import { Show } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/list";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

const TYPES = { unordered: ark.ul, ordered: ark.ol } as const;

export interface ListRootProps extends Pick<SystemStyleObject, "colorPalette"> {
	type: "unordered" | "ordered";
}

export function Root({ type, colorPalette = "blue", children, ...rest }: Assign<ComponentProps<typeof Builder.Root>, ListRootProps>) {
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

export interface ListItemProps {
	indicator?: ComponentType<LucideProps>;
}

export function Item({ indicator: Indicator = ArrowRightIcon, children, ...rest }: Assign<ComponentProps<typeof Builder.Item>, ListItemProps>) {
	const api = Builder.useListContext();

	return (
		<Builder.Item {...rest}>
			<Show when={api.variant === "plain"}>
				<Builder.Indicator>
					<Indicator />
				</Builder.Indicator>
			</Show>
			{children}
		</Builder.Item>
	);
}
