import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import LightingPreview from "$/components/legacy/Preview/LightingPreview";
import ReduxForwardingCanvas from "$/components/legacy/ReduxForwardingCanvas";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<LightingPreview />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
