import { throttle } from "@tanstack/react-pacer";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HStack, styled } from "$:styled-system/jsx";
import { hstack, stack } from "$:styled-system/patterns";

interface TocEntry {
	title: string;
	url: string;
	items: TocEntry[];
}

function useActiveHeading(headings: TocEntry[], container: HTMLElement) {
	const [activeHeadingId, setActiveHeading] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = throttle(
			() => {
				// If we're all the way at the top, there is no active heading.
				// This is done because "Introduction", the first link in the TOC, will be active if `heading` is `null`.
				if (container.scrollTop === 0) {
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

		container.addEventListener("scroll", handleScroll);

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [activeHeadingId, headings, container]);

	return activeHeadingId;
}

function getGithubLink(pathname: string) {
	const prefix = "https://github.com/bsmg/beatmapper/edit/master/src/content";
	return `${prefix + pathname}/index.mdx`;
}

interface Props {
	toc: TocEntry[];
}

const TableOfContents = ({ toc }: Props) => {
	const headings = toc;

	const container = useRef(document.querySelector("main") as HTMLElement);

	const activeHeadingId = useActiveHeading(headings, container.current);

	const handleClickIntro = () => {
		container.current.scrollTo({ top: 0 });
	};

	return (
		<Wrapper>
			<Title>Table of Contents</Title>

			<HeadingLink href="#" onClick={handleClickIntro} data-active={!activeHeadingId}>
				Introduction
			</HeadingLink>

			{headings.map((entry) => {
				const id = entry.url.replace("#", "");
				return (
					<HeadingLink key={id} href={entry.url} data-active={id === activeHeadingId}>
						{entry.title}
					</HeadingLink>
				);
			})}

			<GithubLink href={getGithubLink(location.pathname)}>
				<HStack gap={1}>
					Suggest an edit
					<ExternalLinkIcon size={15} />
				</HStack>
			</GithubLink>
		</Wrapper>
	);
};

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
		color: { base: "fg.muted", _active: "colorPalette.700" },
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

export default TableOfContents;
