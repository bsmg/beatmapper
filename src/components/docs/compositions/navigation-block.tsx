import { ark } from "@ark-ui/react/factory";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Text } from "$/components/ui/compositions";
import { docs } from "$:content";
import { HStack, Stack, styled } from "$:styled-system/jsx";

interface NavProps {
	direction: "previous" | "next";
	item?: { id: string; title: string };
}
function DocsNavigationBlock({ direction, item }: NavProps) {
	const formattedSubtitle = useMemo(() => (direction === "previous" ? "« PREVIOUS" : "NEXT »"), [direction]);

	return (
		<Stack gap={0.5} align={direction === "previous" ? "flex-start" : "flex-end"}>
			<Text color={"fg.muted"} fontSize={"14px"}>
				{item && formattedSubtitle}
			</Text>
			<LinkWrapper asChild>
				<Link to={"/docs/$"} params={{ _splat: item?.id }}>
					{item?.title}
				</Link>
			</LinkWrapper>
		</Stack>
	);
}

const LinkWrapper = styled(ark.span, {
	base: {
		textStyle: "link",
		fontSize: "20px",
		fontWeight: "bold",
		colorPalette: "blue",
		color: { _light: "colorPalette.700", _dark: "colorPalette.300" },
	},
});

interface Props {
	prev?: string;
	next?: string;
}
function PreviousNextBar({ prev: prevId, next: nextId }: Props) {
	const previous = useMemo(() => docs.find((page) => page.id === prevId), [prevId]);
	const next = useMemo(() => docs.find((page) => page.id === nextId), [nextId]);

	return (
		<Stack gap={2}>
			<Divider color={"border.muted"} />
			<HStack gap={2} justify={"space-between"}>
				<DocsNavigationBlock direction="previous" item={previous} />
				<DocsNavigationBlock direction="next" item={next} />
			</HStack>
		</Stack>
	);
}

const Divider = styled("hr", {
	base: {
		borderColor: "border.muted",
	},
});

export default PreviousNextBar;
