import { index, layout, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
	index("index.tsx"),
	route("sandbox", "sandbox.local.tsx"),
	layout("/docs/_", "docs/layout.tsx", [
		route("$", "docs/splat.tsx"),
		//
	]),
	layout("/edit/$sid/$bid/_", "editor/layout.tsx", [
		layout("page", "editor/page/layout.tsx", [
			route("details", "editor/page/details.tsx"),
			route("download", "editor/page/download.tsx"),
			//
		]),
		layout("scene", "editor/scene/layout.tsx", [
			route("notes", "editor/scene/notes.tsx"),
			route("events", "editor/scene/events.tsx"),
			route("preview", "editor/scene/preview.tsx"),
			//
		]),
		//
	]),
	//
]);
