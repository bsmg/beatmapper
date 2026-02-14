import { ExternalLinkIcon } from "lucide-react";
import { Fragment } from "react";

import { For } from "$/components/ui/atoms";
import { AnchorLink } from "$/components/ui/compositions";
import type { Doc } from "$:content";
import { HStack } from "$:styled-system/jsx";
import { Toc } from "../layouts";

interface Props {
	toc: Doc["tableOfContents"];
	container: HTMLElement | null;
}
function DocsTableOfContents({ toc, container }: Props) {
	return (
		<Toc.Root toc={toc} container={container}>
			<Toc.Header>Table of Contents</Toc.Header>
			<Toc.Context>
				{({ activeHeadingId }) => (
					<Fragment>
						<Toc.Item href="#" aria-current={activeHeadingId === null} onClick={() => container?.scrollTo({ top: 0 })}>
							Introduction
						</Toc.Item>
						<For each={toc}>
							{(entry) => (
								<Toc.Item key={entry.url} href={entry.url} aria-current={entry.url === activeHeadingId}>
									{entry.title}
								</Toc.Item>
							)}
						</For>
					</Fragment>
				)}
			</Toc.Context>
			<Toc.Footer>
				<AnchorLink href={`https://github.com/bsmg/beatmapper/edit/master/src/content${location.pathname}/index.mdx`}>
					<HStack gap={1}>
						Suggest an edit
						<ExternalLinkIcon size={15} />
					</HStack>
				</AnchorLink>
			</Toc.Footer>
		</Toc.Root>
	);
}

export default DocsTableOfContents;
