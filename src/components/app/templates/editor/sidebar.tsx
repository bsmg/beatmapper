import { Link, useLocation } from "@tanstack/react-router";
import { BookOpenIcon, BoxIcon, DownloadIcon, HomeIcon, ListIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";

import type { BeatmapId, SongId } from "$/types";

import { AppSettingsForm } from "$/components/app/forms";
import { Sidebar } from "$/components/app/layouts";
import { Dialog } from "$/components/ui/compositions";
import { useMemo } from "react";

interface Props {
	sid: SongId;
	bid: BeatmapId;
}
function EditorSidebar({ sid, bid }: Props) {
	const location = useLocation();
	const params = useMemo(() => ({ sid: sid.toString(), bid: bid.toString() }), [sid, bid]);

	return (
		<Sidebar.Root onWheel={(ev) => ev.stopPropagation()}>
			<Sidebar.Section>
				<Sidebar.Item icon={HomeIcon}>{(children) => <Link to="/">{children}</Link>}</Sidebar.Item>
				<Sidebar.Divider />
				<Sidebar.Item tooltip="Notes" icon={BoxIcon} active={!!location.pathname.match(/\/notes$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/notes"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Events" icon={ZapIcon} active={!!location.pathname.match(/\/events$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/events"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Preview" icon={PlayIcon} active={!!location.pathname.match(/\/preview$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/preview"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Details" icon={ListIcon} active={!!location.pathname.match(/\/details$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/details"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Download" icon={DownloadIcon} active={!!location.pathname.match(/\/download$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/download"} params={params}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
			<Sidebar.Section>
				<Sidebar.Item tooltip="App settings" icon={SettingsIcon} active={false}>
					{(children) => (
						<Dialog title="App Settings" render={() => <AppSettingsForm />}>
							<span>{children}</span>
						</Dialog>
					)}
				</Sidebar.Item>
				<Sidebar.Item tooltip="Help" icon={BookOpenIcon}>
					{(children) => (
						<Link to="/docs/$" params={{ _splat: "intro" }}>
							{children}
						</Link>
					)}
				</Sidebar.Item>
			</Sidebar.Section>
		</Sidebar.Root>
	);
}

export default EditorSidebar;
