import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { NavigationPanel } from "$/components/app/layouts";
import { EditorAudioVisualizer, EditorNavigationControls, EditorSongInfo, EditorStatusBar } from "$/components/app/templates/editor";
import { useToaster } from "$/components/context";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { downloadMapFiles, saveMapFiles, startLoadingMap } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo, selectLoading } from "$/store/selectors";
import { View } from "$/types";
import { styled } from "$:styled-system/jsx";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const { view } = Route.useRouteContext();

	const toaster = useToaster();

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const isDemo = useAppSelector((state) => selectDemo(state, sid));

	const scopes = useMemo(() => getHotkeyScopes("editor"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);
	const enabled = useMemo(() => !isLoading, [isLoading]);

	useHotkey({ scopes, category, label: "Reload Map", hotkey: "Shift+F5", action: () => dispatch(startLoadingMap({ songId: sid, beatmapId: bid })) });

	useHotkey({ scopes, category, label: "Save Map", hotkey: "Mod+S", action: () => dispatch(saveMapFiles()) });

	useHotkey({
		scopes,
		category,
		label: "Download Map",
		hotkey: "Mod+P",
		action: () => {
			if (import.meta.env.PROD && isDemo) {
				return toaster.create({
					id: "demo-download-blocker",
					type: "info",
					description: "Unfortunately, the demo map is not available for download.",
				});
			}
			return dispatch(downloadMapFiles({ songId: sid, options: { version: null } }));
		},
	});

	useGlobalEventListener("beforeunload", () => {
		if (!enabled) return;
		return dispatch(saveMapFiles());
	});

	const store = useHotkeyStore();

	useEffect(() => {
		store.addScope(view);
		return () => {
			store.removeScope(view);
		};
	});

	return (
		<Wrapper>
			<EditorSongInfo showDifficultySelector={view !== View.LIGHTSHOW} />
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
