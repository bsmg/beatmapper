import { docs } from "velite:content";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { ErrorBoundary } from "$/components/app/layouts";
import DocsPageLayout from "$/components/docs/templates/page";

export const Route = createFileRoute("/_/docs/_/$")({
	component: RouteComponent,
	errorComponent: (ctx) => <ErrorBoundary {...ctx} interactive={false} />,
	// todo: make this less stupid and give the user a proper light/dark toggle
	onEnter: async () => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		await new Promise(() => {
			document.body.className = mediaQuery.matches ? "dark" : "light";
		});
	},
	onLeave: async () => {
		await new Promise(() => {
			document.body.className = "dark";
		});
	},
});

function RouteComponent() {
	const { _splat } = Route.useParams();

	const document = useMemo(() => {
		if (!_splat) throw new Error("No splat provided.");
		const match = docs.find((x) => x.id === _splat);
		if (!match) throw new Error(`No document for splat: ${_splat}`);
		return match;
	}, [_splat]);

	return <DocsPageLayout id={document.id} />;
}
