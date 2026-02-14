import { ark } from "@ark-ui/react/factory";
import { useMemo } from "react";

import { RouterLink } from "$/components/ui/compositions";
import { docs } from "$:content";
import { Divider, HStack, Stack, styled, Text } from "$:styled-system/jsx";

interface NavProps {
	direction: "previous" | "next";
	item?: { id: string; title: string };
}
function NavigationBlock({ direction, item }: NavProps) {
	const formattedSubtitle = useMemo(() => (direction === "previous" ? "« PREVIOUS" : "NEXT »"), [direction]);

	return (
		<Stack gap={0.5} align={direction === "previous" ? "flex-start" : "flex-end"}>
			<Text textStyle={"paragraph"} color={"fg.muted"} fontSize={"14px"}>
				{item && formattedSubtitle}
			</Text>
			<RouterLink as={LinkWrapper} to={"/docs/$"} params={{ _splat: item?.id }}>
				{item?.title}
			</RouterLink>
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
function DocsNavigation({ prev: prevId, next: nextId }: Props) {
	const previous = useMemo(() => docs.find((page) => page.id === prevId), [prevId]);
	const next = useMemo(() => docs.find((page) => page.id === nextId), [nextId]);

	return (
		<Stack gap={2}>
			<Divider color={"border.muted"} />
			<HStack gap={2} justify={"space-between"}>
				<NavigationBlock direction="previous" item={previous} />
				<NavigationBlock direction="next" item={next} />
			</HStack>
		</Stack>
	);
}

export default DocsNavigation;
