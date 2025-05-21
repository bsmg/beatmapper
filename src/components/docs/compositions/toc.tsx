import type { Doc } from "velite:content";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { Member } from "$/types";

import { HStack, styled } from "$:styled-system/jsx";
import { hstack, stack } from "$:styled-system/patterns";

const container = document.querySelector("main");

type TocEntry = Member<Doc["tableOfContents"]>;

// TODO: fix this container hell
function useActiveHeading(headings: TocEntry[]) {
	const [activeHeadingId, setActiveHeading] = useState<string | null>(null);

	const handleScroll = useThrottledCallback(
		() => {
			// If we're all the way at the top, there is no active heading.
			// This is done because "Introduction", the first link in the TOC, will be active if `heading` is `null`.
			if (container?.scrollTop === 0) {
				return setActiveHeading(null);
			}

			// There HAS to be a better single-step algorithm for this, but I can't think of it. So I'm doing this in 2 steps:
			// 1. Are there any headings in the viewport right now? If so, pick the top one.
			// 2. If there are no headings in the viewport, are there any above the viewport? If so, pick the last one (most recently scrolled out of view)
			// If neither condition is met, I'll assume I'm still in the intro, although this would have to be a VERY long intro to ever be true.
			const headingBoxes = headings.map((entry) => {
				const elem = document.querySelector(entry.url);
				return { id: entry.url.replace("#", ""), box: elem?.getBoundingClientRect() };
			});

			// The first heading within the viewport is the one we want to highlight.
			let firstHeadingInViewport = headingBoxes.find(({ box }) => {
				return box && box.bottom > 0 && box.top < window.innerHeight;
			});

			// If there is no heading in the viewport, check and see if there are any above the viewport.
			if (!firstHeadingInViewport) {
				const reversedBoxes = [...headingBoxes].reverse();

				firstHeadingInViewport = reversedBoxes.find(({ box }) => {
					return box && box.bottom < 0;
				});
			}

			if (!firstHeadingInViewport) {
				setActiveHeading(null);
			} else if (firstHeadingInViewport.id !== activeHeadingId) {
				setActiveHeading(firstHeadingInViewport.id);
			}
		},
		{ wait: 500 },
	);

	useEffect(() => {
		container?.addEventListener("scroll", handleScroll);
		return () => {
			container?.removeEventListener("scroll", handleScroll);
		};
	}, [handleScroll]);

	return activeHeadingId;
}

interface Props {
	toc: TocEntry[];
}
function DocsTableOfContents({ toc }: Props) {
	return (
		<Wrapper>
			<Title>Table of Contents</Title>
			<HeadingLink href="#" onClick={() => container?.scrollTo({ top: 0 })}>
				Introduction
			</HeadingLink>
			{toc.map((entry) => (
				<HeadingLink key={entry.url.replace("#", "#introduction")} href={entry.url}>
					{entry.title}
				</HeadingLink>
			))}
			<GithubLink href={`https://github.com/bsmg/beatmapper/edit/master/src/content${location.pathname}/index.mdx`}>
				<HStack gap={1}>
					Suggest an edit
					<ExternalLinkIcon size={15} />
				</HStack>
			</GithubLink>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		position: { base: undefined, lg: "sticky" },
		gap: 0,
		minWidth: "180px",
		width: "100%",
		flexBasis: "180px",
		lineHeight: 1.4,
		top: 2,
	}),
});

const Title = styled("h4", {
	base: {
		fontWeight: "bold",
		borderBottomWidth: "sm",
		borderColor: "border.default",
		paddingBottom: 1,
		marginBottom: 1,
	},
});

const HeadingLink = styled("a", {
	base: {
		textStyle: "link",
		colorPalette: "pink",
		color: { base: "fg.muted", _hover: "fg.default", _active: { _light: "colorPalette.700", _dark: "colorPalette.300" } },
		paddingBlock: 1,
	},
});

const GithubLink = styled("a", {
	base: hstack.raw({
		textStyle: "link",
		fontWeight: "bold",
		color: "fg.default",
		borderTopWidth: "sm",
		borderColor: "border.default",
		paddingTop: 1,
		marginTop: 1,
	}),
});

export default DocsTableOfContents;
