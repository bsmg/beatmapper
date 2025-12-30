import { createFileRoute, Outlet } from "@tanstack/react-router";

import { EditorView } from "$/components/app/layouts";
import { View } from "$/types";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene")({
	component: RouteComponent,
});

function RouteComponent() {
	const { view } = Route.useRouteContext();

	return (
		<EditorView.Root>
			<EditorView.Scene showBeatmapPicker={view !== View.LIGHTSHOW}>
				<Outlet />
			</EditorView.Scene>
		</EditorView.Root>
	);
}
