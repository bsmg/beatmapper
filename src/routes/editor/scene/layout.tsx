import { createFileRoute, Outlet } from "@tanstack/react-router";

import { NavigationPanel } from "$/components/app/layouts";
import { EditorAudioVisualizer, EditorNavigationControls, EditorSongInfo, EditorStatusBar } from "$/components/app/templates/editor";
import { DefaultEditorShortcuts } from "$/components/app/templates/shortcuts";
import { View } from "$/types";
import { styled } from "$:styled-system/jsx";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene")({
	component: RouteComponent,
});

function RouteComponent() {
	const { view } = Route.useRouteContext();

	return (
		<Wrapper>
			<EditorSongInfo showDifficultySelector={view !== View.LIGHTSHOW} />
			<Outlet />
			<NavigationPanel.Root>
				<EditorNavigationControls />
				<EditorAudioVisualizer />
			</NavigationPanel.Root>
			<EditorStatusBar />
			<DefaultEditorShortcuts />
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		backgroundColor: "bg.contrast",
		boxSize: "100%",
	},
});
