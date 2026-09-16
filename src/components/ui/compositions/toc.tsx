import type { TocItemData } from "@ark-ui/react/toc";
import { type PropsWithChildren, type ReactNode, useRef } from "react";

import { For, Show } from "$/components/ui/atoms";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/toc";

export interface ProseProps<T extends TocItemData> extends PropsWithChildren {
	tableOfContents: T[];
	content: ReactNode;
}

export function Prose<T extends TocItemData>({ tableOfContents, content, children, ...rest }: ProseProps<T>) {
	const container = useRef<HTMLElement>(document.querySelector("main"));

	const Content = useRender(Builder.Content, toPolymorphic("article"));

	return (
		<Builder.Root {...rest} autoScroll={false} scrollEl={() => container.current} items={tableOfContents}>
			{content && <Content>{content}</Content>}
			<Builder.Nav>
				<Builder.Title onClick={() => container.current.scrollTo({ top: 0 })}>Table of Contents</Builder.Title>
				<Builder.List>
					<For each={tableOfContents}>
						{(item) => (
							<Builder.Item asChild key={item.value} item={item}>
								<Builder.Link href={`#${item.value}`}>{"label" in item && typeof item.label === "string" ? item.label : item.value}</Builder.Link>
							</Builder.Item>
						)}
					</For>
				</Builder.List>
				<Show when={children}>{(content) => <Builder.Actions>{content}</Builder.Actions>}</Show>
			</Builder.Nav>
		</Builder.Root>
	);
}
