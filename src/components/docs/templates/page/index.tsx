import { type PropsWithChildren, useMemo } from "react";

import DocsTableOfContents from "$/components/docs/templates/toc";
import { docs } from "$:content";
import { Divider, Stack, styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import DocsNavigation from "./navigation";
import DocsProse from "./prose";

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
				<DocsProse code={entry.code} />
				<DocsTableOfContents container={container} toc={entry.tableOfContents} />
			</ContentWrapper>
			{(entry.prev || entry.next) && <DocsNavigation prev={entry.prev} next={entry.next} />}
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

export default DocsPageLayout;
