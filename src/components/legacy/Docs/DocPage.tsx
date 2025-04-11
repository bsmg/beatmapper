import { docs } from "velite:content";
import type { MDXComponents } from "mdx/types";
import { Fragment, type PropsWithChildren, useMemo } from "react";
import { Helmet } from "react-helmet";

import { Divider, Stack, styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import MdxWrapper from "./MdxWrapper";
import PreviousNextBar from "./PreviousNextBar";
import TableOfContents from "./TableOfContents";

interface Props extends PropsWithChildren {
	id: string;
	components?: MDXComponents;
}

const DocPage = ({ id, components }: Props) => {
	const document = useMemo(() => docs.find((x) => x.id === id), [id]);
	if (!document) {
		throw new Error("No doc found at this route.");
	}

	return (
		<Fragment>
			<Helmet>
				<title>Beatmapper Docs - {document.title}</title>
			</Helmet>
			<Wrapper>
				<Stack gap={2}>
					<Title>{document.title}</Title>
					{document.subtitle && <Subtitle>{document.subtitle}</Subtitle>}
				</Stack>
				<Divider color={"border.muted"} />
				<ContentWrapper>
					<MainContent>
						<MdxWrapper components={components} code={document.code} />
					</MainContent>
					<TableOfContents toc={document.tableOfContents} />
				</ContentWrapper>
				{(document.prev || document.next) && <PreviousNextBar prev={document.prev} next={document.next} />}
			</Wrapper>
		</Fragment>
	);
};

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
		flex: 1,
	},
});

export default DocPage;
