import { createFileRoute } from "@tanstack/react-router";

import { ErrorBoundary } from "$/components/app/layouts";
import DocsPageLayout from "$/components/docs/templates/page";
import { type Doc, docs } from "$:content";

// hack: tsr rewrites only work with a server environment, so we'll just cheat if we navigate to an old route
function rewriteId(splat: string | undefined) {
	if (!splat) return "welcome";
	if (splat === "intro") return "welcome";
	if (splat === "privacy") return "privacy-policy";
	if (splat === "keyboard-shortcuts") return "shortcuts";
	if (splat === "hotkeys") return "shortcuts";
	if (splat === "manual/getting-started") return "manual/intro";
	if (splat === "manual/navigating-the-editor") return "manual/navigation";
	if (splat === "manual/notes-view") return "manual/notes";
	if (splat === "manual/events-view") return "manual/events";
	if (splat === "manual/demo-view") return "manual/preview";
	return splat;
}

export const Route = createFileRoute("/_/docs/_/$")({
	component: RouteComponent,
	errorComponent: (ctx) => <ErrorBoundary {...ctx} interactive={false} />,
	loader: ({ params }) => {
		const entry = docs.find((x) => x.id === rewriteId(params._splat));
		const container = document.querySelector("main");
		return { container, entry: entry as Doc };
	},
	head: (c) => {
		const { entry } = c.loaderData ?? {};
		return { meta: [{ title: entry?.title ? `${entry?.title} | Beatmapper Docs` : "Beatmapper Docs" }] };
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
