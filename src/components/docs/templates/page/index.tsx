import { ExternalLinkIcon } from "lucide-react";
import { type PropsWithChildren, useMemo, useRef } from "react";

import { AnchorLink, Prose } from "$/components/ui/compositions";
import { allDocs } from "$:content";
import { Divider, HStack, Stack, styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import DocsNavigation from "./navigation";
import DocsProse from "./prose";

interface Props extends PropsWithChildren {
	id: string;
}

function DocsPageLayout({ id }: Props) {
	const entry = useMemo(() => allDocs.find((x) => x.id === id), [id]);

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
			<Prose key={entry.id} tableOfContents={entry.tableOfContents} content={<DocsProse code={entry.code} />}>
				<AnchorLink href={`https://github.com/bsmg/beatmapper/edit/master/src/content${location.pathname}/index.mdx`}>
					<HStack gap={1}>
						Suggest an edit
						<ExternalLinkIcon size={15} />
					</HStack>
				</AnchorLink>
			</Prose>
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

export default DocsPageLayout;
