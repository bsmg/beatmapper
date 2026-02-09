import { createFileRoute } from "@tanstack/react-router";

import { Page } from "$/components/app/layouts";
import { FirstTimeHome, ReturningHome } from "$/components/app/templates/home";
import { useAppSelector } from "$/store/hooks";
import { selectNew } from "$/store/selectors";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const isNewUser = useAppSelector(selectNew);

	return (
		<Page.Root>
			<Page.Header />
			<Page.Content>{isNewUser ? <FirstTimeHome /> : <ReturningHome />}</Page.Content>
			<Page.Footer />
		</Page.Root>
	);
}
