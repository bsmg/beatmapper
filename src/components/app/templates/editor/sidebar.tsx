import { useHotkey } from "@ark-ui/react/hotkeys";
import { useMatchRoute, useNavigate, useParams } from "@tanstack/react-router";
import { BookOpenIcon, BoxIcon, DownloadIcon, HomeIcon, ListIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";
import { useCallback } from "react";

import { AppSettingsForm, ExportMapForm } from "$/components/app/forms";
import { Sidebar } from "$/components/app/layouts";
import { useToaster } from "$/components/context";
import { Button, RouterLink, usePrompt } from "$/components/ui/compositions";
import { downloadMapFiles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo } from "$/store/selectors";
import type { View } from "$/types";

function EditorSidebar() {
	const params = useParams({ from: "/_/edit/$sid/$bid/_" });
	const matchRoute = useMatchRoute();
	const navigate = useNavigate();

	const toaster = useToaster();

	const dispatch = useAppDispatch();
	const isReadonly = useAppSelector((state) => import.meta.env.PROD && selectDemo(state, params.sid));

	const isView = useCallback((to: View) => !!matchRoute({ to: `/edit/$sid/$bid/${to}`, params, fuzzy: true }), [matchRoute, params]);

	useHotkey({ label: "Go to Beatmap View", hotkey: "F1", action: () => navigate({ to: "/edit/$sid/$bid/notes", params, replace: true }) });
	useHotkey({ label: "Go to Lightshow View", hotkey: "F2", action: () => navigate({ to: "/edit/$sid/$bid/events", params, replace: true }) });
	useHotkey({ label: "Go to Preview View", hotkey: "F3", action: () => navigate({ to: "/edit/$sid/$bid/preview", params, replace: true }) });
	useHotkey({ label: "Go to Details View", hotkey: "F4", action: () => navigate({ to: "/edit/$sid/$bid/details", params, replace: true }) });

	const { trigger: triggerDownloadPrompt } = usePrompt({
		title: "Download Map",
		description: "Save a copy of this map to your local machine.",
		render: () => <ExportMapForm onSubmit={(options) => dispatch(downloadMapFiles({ songId: params.sid, options }))} />,
	});
	const triggerDownload = useCallback(() => {
		if (isReadonly) {
			return toaster.create({
				id: "demo-download-blocker",
				type: "info",
				description: "This map is not available for download.",
			});
		}
		return triggerDownloadPrompt();
	}, [isReadonly, toaster, triggerDownloadPrompt]);

	useHotkey({ label: "Download Map", hotkey: "Mod+P", action: () => triggerDownload() });

	const { trigger: triggerSettings } = usePrompt({
		title: "App Settings",
		render: () => <AppSettingsForm />,
	});

	useHotkey({ label: "View Settings", hotkey: "Mod+,", action: () => triggerSettings() });
	useHotkey({ label: "View Documentation", hotkey: "?", action: () => navigate({ to: "/docs" }) });

	return (
		<Sidebar.Root onWheel={(ev) => ev.stopPropagation()}>
			<Sidebar.Section>
				<Sidebar.Item icon={HomeIcon}>
					{(children) => (
						<RouterLink to="/" replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
				<Sidebar.Divider />
				<Sidebar.Item tooltip="Beatmap" icon={BoxIcon} active={isView("notes")}>
					{(children) => (
						<RouterLink to={"/edit/$sid/$bid/notes"} params={params} replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Lightshow" icon={ZapIcon} active={isView("events")}>
					{(children) => (
						<RouterLink to={"/edit/$sid/$bid/events"} params={params} replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Preview" icon={PlayIcon} active={isView("preview")}>
					{(children) => (
						<RouterLink to={"/edit/$sid/$bid/preview"} params={params} replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Details" icon={ListIcon} active={isView("details")}>
					{(children) => (
						<RouterLink to={"/edit/$sid/$bid/details"} params={params} replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
			<Sidebar.Section>
				<Sidebar.Item tooltip="Download" icon={DownloadIcon} active={false}>
					{(children) => (
						<Button unstyled onClick={triggerDownload} tabIndex={0}>
							{children}
						</Button>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Settings" icon={SettingsIcon} active={false}>
					{(children) => (
						<Button unstyled onClick={triggerSettings} tabIndex={0}>
							{children}
						</Button>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Documentation" icon={BookOpenIcon}>
					{(children) => (
						<RouterLink to="/docs/$" params={{ _splat: "welcome" }} replace={true} tabIndex={0}>
							{children}
						</RouterLink>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
		</Sidebar.Root>
	);
}

export default EditorSidebar;
