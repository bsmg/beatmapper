import type { ComponentProps } from "react";
import { Icon, type IconProp } from "react-icons-kit";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { COLORS, SIDEBAR_WIDTH, UNIT } from "$/constants";

import BaseLink from "../BaseLink";

interface Props extends ComponentProps<typeof BaseLink> {
	isActive?: boolean;
	icon: IconProp["icon"];
}

const SidebarNavItem = ({ ref, isActive, title, icon, to, onClick, ...delegated }: Props) => {
	return (
		<Tooltip disabled={!title} title={title} position="right" delay={500} distance={UNIT * 2} animateFill={false}>
			<Wrapper>
				<ActiveIndicator style={{ transform: isActive ? "translateX(0)" : "translateX(-4px)" }} />
				<LinkElem
					to={to}
					style={{
						color: isActive ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.65)",
					}}
					onClick={onClick}
					{...delegated}
				>
					<Icon icon={icon} size={20} />
				</LinkElem>
			</Wrapper>
		</Tooltip>
	);
};

const SIZE = SIDEBAR_WIDTH - UNIT * 2;

const ActiveIndicator = styled.div`
  position: absolute;
  top: 4px;
  left: -${UNIT}px;
  bottom: 4px;
  width: 4px;
  background: ${COLORS.pink[500]};
  border-radius: 0 4px 4px 0;
  transition: transform 300ms;
`;

const Wrapper = styled.div`
  position: relative;
  width: ${SIZE}px;
  height: ${SIZE}px;
`;

const LinkElem = styled(BaseLink)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

export default SidebarNavItem;
