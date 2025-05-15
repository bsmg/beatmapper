import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/preview")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	return (
		<Fragment>
			<ReduxForwardingCanvas>
				<DefaultEnvironment sid={sid} bid={bid} />
			</ReduxForwardingCanvas>
		</Fragment>
	);
}
