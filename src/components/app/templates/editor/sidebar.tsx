import { Link, useMatchRoute, useParams } from "@tanstack/react-router";
import { BookOpenIcon, BoxIcon, DownloadIcon, HomeIcon, ListIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";

import { AppSettingsForm } from "$/components/app/forms";
import { Sidebar } from "$/components/app/layouts";
import { Dialog } from "$/components/ui/compositions";
import type { View } from "$/types";

function EditorSidebar() {
	const params = useParams({ from: "/_/edit/$sid/$bid" });
	const matchRoute = useMatchRoute();

	const isView = (to: View) => {
		return !!matchRoute({ to: `/edit/$sid/$bid/${to}`, params, fuzzy: true });
	};

	return (
		<Sidebar.Root onWheel={(ev) => ev.stopPropagation()}>
			<Sidebar.Section>
				<Sidebar.Item icon={HomeIcon}>{(children) => <Link to="/">{children}</Link>}</Sidebar.Item>
				<Sidebar.Divider />
				<Sidebar.Item tooltip="Beatmap" icon={BoxIcon} active={isView("notes")}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/notes"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Lightshow" icon={ZapIcon} active={isView("events")}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/events"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Preview" icon={PlayIcon} active={isView("preview")}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/preview"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Details" icon={ListIcon} active={isView("details")}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/details"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Download" icon={DownloadIcon} active={isView("download")}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/download"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
			<Sidebar.Section>
				<Sidebar.Item tooltip="Settings" icon={SettingsIcon} active={false}>
					{(children) => (
						<Dialog title="App Settings" render={() => <AppSettingsForm />}>
							{children}
						</Dialog>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Documentation" icon={BookOpenIcon}>
					{(children) => (
						<Link to="/docs/$" params={{ _splat: "welcome" }}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
		</Sidebar.Root>
	);
}

export default EditorSidebar;
