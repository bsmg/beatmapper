import { NavLink as NavLinkRaw } from "react-router-dom";
import styled from "styled-components";

import { COLORS } from "$/constants";

import Logo from "../Logo";
import NavGroup from "./NavGroup";

const Sidebar = () => {
	return (
		<Wrapper>
			<Header>
				<Logo color="#000" />
			</Header>
			<Navigation>
				<NavGroup>
					<NavLink to="/docs/intro">About</NavLink>
					<NavLink to="/docs/keyboard-shortcuts">Keyboard shortcuts</NavLink>
				</NavGroup>
				<NavGroup title="User Manual" showByDefault>
					<NavLink to="/docs/manual/getting-started">Getting started</NavLink>
					<NavLink to="/docs/manual/navigating-the-editor">Navigating the editor</NavLink>
					<NavLink to="/docs/manual/notes-view">Notes view</NavLink>
					<NavLink to="/docs/manual/events-view">Events view</NavLink>
					<NavLink to="/docs/manual/demo-view">Demo view</NavLink>
					<NavLink to="/docs/manual/publishing">Downloading and publishing</NavLink>
				</NavGroup>
				<NavGroup title="Advanced">
					<NavLink to="/docs/migrating">Migrating from another editor</NavLink>
					<NavLink to="/docs/mods">Mod support</NavLink>
					<NavLink to="/docs/fast-walls">Fast walls</NavLink>
					<NavLink to="/docs/running-locally">Running locally</NavLink>
				</NavGroup>
				<NavGroup title="Release Notes">
					<NavLink to="/docs/releases/0.2">v0.2</NavLink>
					<NavLink to="/docs/releases/0.3">v0.3</NavLink>
				</NavGroup>
				<NavGroup title="Legal">
					<NavLink to="/docs/content-policy">Content policy</NavLink>
					<NavLink to="/docs/privacy">Privacy</NavLink>
				</NavGroup>
			</Navigation>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: sticky;
  top: 0;
`;

const Navigation = styled.nav`
  padding-left: 12px;
`;

const NavLink = styled(NavLinkRaw)`
  display: flex;
  align-items: center;
  height: 35px;
  color: ${COLORS.blueGray[700]};
  font-family: 'system';
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;

  &:hover {
    color: ${COLORS.blueGray[400]};
  }

	&.active {
		color: ${COLORS.blue[500]};
	}
`;

const Header = styled.header`
  height: 80px;
  border-bottom: 1px solid ${COLORS.blueGray[100]};
  display: flex;
  align-items: center;
  padding: 0 20px;
`;

export default Sidebar;
