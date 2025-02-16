import { index, layout, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
	index("index.tsx"),
	layout("/docs/_", "docs/layout.tsx", [
		route("$", "docs/splat.tsx"),
		//
	]),
	layout("/edit/$sid/$bid/_", "editor/layout.tsx", [
		route("details", "editor/details.tsx"),
		route("notes", "editor/notes.tsx"),
		route("events", "editor/events.tsx"),
		route("preview", "editor/preview.tsx"),
		route("download", "editor/download.tsx"),
		//
	]),
	//
]);
