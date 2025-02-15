import { docs } from "velite:content";
import { NavLink as NavLinkRaw } from "react-router-dom";
import styled from "styled-components";

import { COLORS } from "$/constants";

import Logo from "../Logo";
import NavGroup from "./NavGroup";

function getDocsForCategory(category: string | null) {
	return docs.filter((x) => x.category === category).sort((a, b) => a.order - b.order);
}

const Sidebar = () => {
	return (
		<Wrapper>
			<Header>
				<Logo color="#000" />
			</Header>
			<Navigation>
				<NavGroup>
					{getDocsForCategory(null).map((entry) => {
						return (
							<NavLink key={entry.id} to={`/docs/${entry.id}`}>
								{entry.title}
							</NavLink>
						);
					})}
				</NavGroup>
				<NavGroup title="User Manual" showByDefault>
					{getDocsForCategory("manual").map((entry) => {
						return (
							<NavLink key={entry.id} to={`/docs/manual/${entry.id}`}>
								{entry.title}
							</NavLink>
						);
					})}
				</NavGroup>
				<NavGroup title="Advanced">
					{getDocsForCategory("advanced").map((entry) => {
						return (
							<NavLink key={entry.id} to={`/docs/${entry.id}`}>
								{entry.title}
							</NavLink>
						);
					})}
				</NavGroup>
				<NavGroup title="Release Notes">
					{getDocsForCategory("release-notes").map((entry) => {
						return (
							<NavLink key={entry.id} to={`/docs/releases/${entry.id}`}>
								{entry.title}
							</NavLink>
						);
					})}
				</NavGroup>
				<NavGroup title="Legal">
					{getDocsForCategory("legal").map((entry) => {
						return (
							<NavLink key={entry.id} to={`/docs/${entry.id}`}>
								{entry.title}
							</NavLink>
						);
					})}
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
