import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { NavigationPanel } from "$/components/app/layouts";
import { EditorAudioVisualizer, EditorNavigationControls, EditorSongInfo, EditorStatusBar } from "$/components/app/templates/editor";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { saveMapFiles, startLoadingMap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading } from "$/store/selectors";
import { styled } from "$:styled-system/jsx";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const { view } = Route.useRouteContext();

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);

	const scopes = useMemo(() => getHotkeyScopes("editor"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);
	const enabled = useMemo(() => !isLoading, [isLoading]);

	useHotkey({ scopes, category, label: "Reload Map", hotkey: "Shift+F5", action: () => dispatch(startLoadingMap({ songId: sid, beatmapId: bid })) });

	useHotkey({ scopes, category, label: "Save Map", hotkey: "Mod+S", action: () => dispatch(saveMapFiles()) });

	useGlobalEventListener("beforeunload", () => {
		if (!enabled) return;
		return dispatch(saveMapFiles());
	});

	const store = useHotkeyStore();

	useEffect(() => {
		store.addScope("navigation");
		store.addScope(view);
		return () => {
			store.addScope("navigation");
			store.removeScope(view);
		};
	});

	return (
		<Wrapper>
			<EditorSongInfo />
			<Outlet />
			<NavigationPanel.Root>
				<EditorNavigationControls />
				<EditorAudioVisualizer />
			</NavigationPanel.Root>
			<EditorStatusBar />
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		backgroundColor: "bg.contrast",
		boxSize: "100%",
	},
});
