import type { Assign } from "@ark-ui/react";
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import type { Member } from "$/types";
import type { Doc } from "$:content";
import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { Provider } from "./context";

type TocEntry = Member<Doc["tableOfContents"]>;

function useToc(headings: TocEntry[], containerElement: HTMLElement | null) {
	const scrollContainerRef = useRef<HTMLElement | null>(null);
	const headingElementsRef = useRef<{ id: string; element: HTMLElement | null }[]>([]);

	const [activeHeadingId, setActiveHeading] = useState<string | null>(null);

	useEffect(() => {
		headingElementsRef.current = headings.map((entry) => ({
			id: entry.url,
			element: document.querySelector(entry.url),
		}));
	}, [headings]);

	const handleScroll = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

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
			return { id: entry.url, box: elem?.getBoundingClientRect() };
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
			if (activeHeadingId !== null) {
				setActiveHeading(null);
			}
		} else if (firstHeadingInViewport.id !== activeHeadingId) {
			setActiveHeading(firstHeadingInViewport.id);
		}
	}, [headings, activeHeadingId]);

	useEffect(() => {
		const effectiveContainer = containerElement ?? document.querySelector("main");

		if (scrollContainerRef.current !== effectiveContainer) {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.removeEventListener("scroll", handleScroll);
			}
			scrollContainerRef.current = effectiveContainer;
		}

		if (scrollContainerRef.current) {
			scrollContainerRef.current.addEventListener("scroll", handleScroll);
			handleScroll();
		}

		return () => {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.removeEventListener("scroll", handleScroll);
			}
		};
	}, [containerElement, handleScroll]);

	return { activeHeadingId };
}

interface Props {
	toc: TocEntry[];
	container: HTMLElement | null;
}
function DocsTocRoot({ toc, container, children }: Assign<PropsWithChildren, Props>) {
	const tocContext = useToc(toc, container);

	return (
		<Provider value={tocContext}>
			<Wrapper>{children}</Wrapper>
		</Provider>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		position: { base: undefined, lg: "sticky" },
		gap: 0,
		minWidth: "180px",
		width: "100%",
		flexBasis: { base: undefined, lg: "180px" },
		lineHeight: 1.4,
		top: 2,
	}),
});

export default DocsTocRoot;
