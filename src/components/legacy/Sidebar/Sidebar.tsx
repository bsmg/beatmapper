import { getRouteApi, useLocation } from "@tanstack/react-router";
import { BookOpenIcon, BoxIcon, DownloadIcon, HomeIcon, ListIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";
import { Fragment, useState } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import SettingsModal from "../SettingsModal";
import SpacedChildren from "../SpacedChildren";
import Spacer from "../Spacer";
import SidebarNavItem from "./SidebarNavItem";

const route = getRouteApi("/_/edit/$sid/$bid");

const Sidebar = () => {
	const location = useLocation();
	const { sid: songId, bid: difficulty } = route.useParams();

	const [showSettingsModal, setShowSettingsModal] = useState(false);

	return (
		<Fragment>
			<SettingsModal
				isVisible={showSettingsModal}
				onDismiss={() => {
					setShowSettingsModal(false);
				}}
			/>

			<Wrapper>
				<Top>
					<Spacer size={token.var("spacing.2")} />
					<SidebarNavItem icon={HomeIcon} to="/" />

					<Spacer size={token.var("spacing.2")} />
					<Divider />
					<Spacer size={token.var("spacing.2")} />

					<SpacedChildren spacing={token.var("spacing.2")}>
						<SidebarNavItem title="Notes" icon={BoxIcon} to={"/edit/$sid/$bid/notes"} params={{ sid: songId, bid: difficulty }} isActive={!!location.pathname.match(/\/notes$/)} />
						<SidebarNavItem title="Events" icon={ZapIcon} to={"/edit/$sid/$bid/events"} params={{ sid: songId, bid: difficulty }} isActive={!!location.pathname.match(/\/events$/)} />
						<SidebarNavItem title="Preview" icon={PlayIcon} to={"/edit/$sid/$bid/preview"} params={{ sid: songId, bid: difficulty }} isActive={!!location.pathname.match(/\/preview$/)} />
						<SidebarNavItem title="Map settings" icon={ListIcon} to={"/edit/$sid/$bid/details"} params={{ sid: songId, bid: difficulty }} isActive={!!location.pathname.match(/\/details$/)} />
						<SidebarNavItem title="Download" icon={DownloadIcon} to={"/edit/$sid/$bid/download"} params={{ sid: songId, bid: difficulty }} isActive={!!location.pathname.match(/\/download$/)} />
					</SpacedChildren>
				</Top>

				<Bottom>
					<SpacedChildren spacing={token.var("spacing.2")}>
						<SidebarNavItem
							title="App settings"
							icon={SettingsIcon}
							onClick={(ev) => {
								ev.preventDefault();
								setShowSettingsModal(true);
							}}
							isActive={false}
						/>
						<SidebarNavItem title="Help" icon={BookOpenIcon} to="/docs/$" params={{ _splat: "intro" }} isActive={false} target="_blank" />
					</SpacedChildren>
				</Bottom>
			</Wrapper>
		</Fragment>
	);
};

const Wrapper = styled.div`
  position: relative;
  width: ${token.var("sizes.sidebar")};
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: ${token.var("colors.slate.700")};
  user-select: none;
`;

const Top = styled.div``;

const Bottom = styled.div``;

const Divider = styled.div`
  height: 0px;
  width: 80%;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.25);
`;

export default Sidebar;
