import { Link, getRouteApi, useLocation } from "@tanstack/react-router";
import { BookOpenIcon, BoxIcon, DownloadIcon, HomeIcon, ListIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";

import { Divider, VStack, styled } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";
import { Dialog } from "$/components/ui/compositions";
import SettingsModal from "../SettingsModal";
import SidebarNavItem from "./SidebarNavItem";

const route = getRouteApi("/_/edit/$sid/$bid");

const Sidebar = () => {
	const location = useLocation();
	const { sid: songId, bid: difficulty } = route.useParams();

	return (
		<Wrapper>
			<VStack gap={2}>
				<SidebarNavItem icon={HomeIcon}>{(children) => <Link to="/">{children}</Link>}</SidebarNavItem>
				<Divider color={"border.default"} />
				<SidebarNavItem tooltip="Notes" icon={BoxIcon} active={!!location.pathname.match(/\/notes$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/notes"} params={{ sid: songId, bid: difficulty }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
				<SidebarNavItem tooltip="Events" icon={ZapIcon} active={!!location.pathname.match(/\/events$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/events"} params={{ sid: songId, bid: difficulty }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
				<SidebarNavItem tooltip="Preview" icon={PlayIcon} active={!!location.pathname.match(/\/preview$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/preview"} params={{ sid: songId, bid: difficulty }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
				<SidebarNavItem tooltip="Details" icon={ListIcon} active={!!location.pathname.match(/\/details$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/details"} params={{ sid: songId, bid: difficulty }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
				<SidebarNavItem tooltip="Download" icon={DownloadIcon} active={!!location.pathname.match(/\/download$/)}>
					{(children) => (
						<Link to={"/edit/$sid/$bid/download"} params={{ sid: songId, bid: difficulty }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
			</VStack>
			<VStack gap={2}>
				<SidebarNavItem tooltip="App settings" icon={SettingsIcon} active={false}>
					{(children) => (
						<Dialog title="App Settings" render={() => <SettingsModal />}>
							<span>{children}</span>
						</Dialog>
					)}
				</SidebarNavItem>
				<SidebarNavItem tooltip="Help" icon={BookOpenIcon}>
					{(children) => (
						<Link to="/docs/$" params={{ _splat: "intro" }}>
							{children}
						</Link>
					)}
				</SidebarNavItem>
			</VStack>
		</Wrapper>
	);
};

const Wrapper = styled(VStack, {
	base: vstack.raw({
		position: "relative",
		width: "sidebar",
		height: "100vh",
		justify: "space-between",
		gap: 2,
		paddingBlock: 2,
		backgroundColor: "bg.subtle",
		borderRightWidth: "sm",
		borderColor: "border.muted",
		userSelect: "none",
	}),
});

export default Sidebar;
