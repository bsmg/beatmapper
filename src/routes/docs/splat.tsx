import { docs } from "velite:content";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import DocPage from "$/components/Docs/DocPage";

export const Route = createFileRoute("/_/docs/_/$")({
	component: RouteComponent,
	errorComponent: (ctx) => ctx.error.message,
});

function RouteComponent() {
	const { _splat } = Route.useParams();

	const document = useMemo(() => {
		if (!_splat) throw new Error("No splat provided.");
		const match = docs.find((x) => x.id === _splat);
		if (!match) throw new Error(`No document for splat: ${_splat}`);
		return match;
	}, [_splat]);

	return <DocPage id={document.id} />;
}
