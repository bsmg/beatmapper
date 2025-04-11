import { docs } from "velite:content";
import { useMemo } from "react";

import { Divider, HStack, Stack } from "$:styled-system/jsx";
import { Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";

interface NavProps {
	direction: "previous" | "next";
	item: { id: string; title: string };
}

const NavigationBlock = ({ direction, item }: NavProps) => {
	const formattedSubtitle = direction === "previous" ? "« PREVIOUS" : "NEXT »";

	return (
		<Stack gap={0.5} align={direction === "previous" ? "flex-start" : "flex-end"}>
			<Text color={"fg.muted"} fontSize={"14px"}>
				{formattedSubtitle}
			</Text>
			<Text textStyle={"link"} colorPalette="blue" color="colorPalette.500" fontSize={"20px"} fontWeight={"bold"}>
				<Link to={"/docs/$"} params={{ _splat: `manual/${item.id}` }}>
					{item.title}
				</Link>
			</Text>
		</Stack>
	);
};

interface Props {
	prev?: string;
	next?: string;
}
const PreviousNextBar = ({ prev: prevId, next: nextId }: Props) => {
	const previous = useMemo(() => docs.find((page) => page.id === prevId), [prevId]);
	const next = useMemo(() => docs.find((page) => page.id === nextId), [nextId]);

	return (
		<Stack gap={2}>
			<Divider color={"border.muted"} />
			<HStack gap={2} justify={"space-between"}>
				{previous && <NavigationBlock direction="previous" item={previous} />}
				{next && <NavigationBlock direction="next" item={next} />}
			</HStack>
		</Stack>
	);
};

export default PreviousNextBar;
