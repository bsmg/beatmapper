import { Outlet, createFileRoute } from "@tanstack/react-router";

import { useViewFromLocation } from "$/components/app/hooks";
import { EditorView } from "$/components/app/layouts";
import { View } from "$/types";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const view = useViewFromLocation();

	return (
		<EditorView.Root>
			<EditorView.Scene sid={sid} bid={bid} showBeatmapPicker={view !== View.LIGHTSHOW}>
				<Outlet />
			</EditorView.Scene>
		</EditorView.Root>
	);
}
