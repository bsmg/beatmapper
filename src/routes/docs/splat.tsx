import { type Doc, docs } from "velite:content";
import { createFileRoute } from "@tanstack/react-router";

import { ErrorBoundary } from "$/components/app/layouts";
import DocsPageLayout from "$/components/docs/templates/page";

export const Route = createFileRoute("/_/docs/_/$")({
	component: RouteComponent,
	errorComponent: (ctx) => <ErrorBoundary {...ctx} interactive={false} />,
	loader: ({ params }) => {
		const entry = docs.find((x) => x.id === params._splat);
		const container = document.querySelector("main");
		return { container, entry: entry as Doc };
	},
	head: (c) => {
		const { entry } = c.loaderData;
		return { meta: [{ title: `${entry.title} | Beatmapper Docs` }] };
	},
	onEnter: (c) => {
		const { container } = c.loaderData ?? {};
		container?.scrollTo({ top: 0 });
	},
});

function RouteComponent() {
	const { container, entry } = Route.useLoaderData();
	return <DocsPageLayout id={entry.id} container={container} />;
}
