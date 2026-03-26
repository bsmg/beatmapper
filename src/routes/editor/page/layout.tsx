import { createFileRoute, Outlet } from "@tanstack/react-router";

import { useMount } from "$/components/hooks/use-mount";
import { pausePlayback } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import { Container, styled } from "$:styled-system/jsx";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_page")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();

	const dispatch = useAppDispatch();

	useMount(() => {
		dispatch(pausePlayback({ songId: sid }));
	});

	return (
		<Wrapper>
			<Container>
				<Outlet />
			</Container>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		maxHeight: "100dvh",
		overflow: "auto",
		paddingBlock: 8,
	},
});
