import { docs } from "velite:content";
import { type PropsWithChildren, useMemo } from "react";

import { Divider, Stack, styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { DocsNavigationBlock, DocsProse, DocsTableOfContents } from "$/components/docs/compositions";

interface Props extends PropsWithChildren {
	id: string;
	container: HTMLElement | null;
}

function DocsPageLayout({ id, container }: Props) {
	const entry = useMemo(() => docs.find((x) => x.id === id), [id]);
	if (!entry) {
		throw new Error("No doc found at this route.");
	}

	return (
		<Wrapper>
			<Stack gap={2}>
				<Title>{entry.title}</Title>
				{entry.subtitle && <Subtitle>{entry.subtitle}</Subtitle>}
			</Stack>
			<Divider color={"border.muted"} />
			<ContentWrapper>
				<MainContent>
					<DocsProse code={entry.code} />
				</MainContent>
				<DocsTableOfContents container={container} toc={entry.tableOfContents} />
			</ContentWrapper>
			{(entry.prev || entry.next) && <DocsNavigationBlock prev={entry.prev} next={entry.next} />}
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		gap: 4,
		paddingBlock: 4,
		paddingInline: { base: 4, md: 8 },
		fontFamily: "'system'",
		width: "100%",
		maxWidth: "1250px",
	}),
});

const Title = styled("div", {
	base: {
		fontSize: "38px",
		color: "fg.default",
		fontWeight: "bold",
	},
});

const Subtitle = styled("div", {
	base: {
		fontSize: "28px",
		color: "fg.muted",
		fontWeight: "normal",
	},
});

const ContentWrapper = styled("div", {
	base: stack.raw({
		align: "start",
		gap: { base: 4, lg: 8 },
		flex: 1,
		direction: { base: "column-reverse", lg: "row" },
	}),
});

const MainContent = styled("div", {
	base: {
		width: "100%",
		flex: 1,
	},
});

export default DocsPageLayout;
