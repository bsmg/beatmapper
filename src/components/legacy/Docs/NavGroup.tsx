import { ChevronDownIcon } from "lucide-react";
import { type PropsWithChildren, useState } from "react";
import styled, { keyframes } from "styled-components";

import { token } from "$:styled-system/tokens";

import UnstyledButton from "../UnstyledButton";

interface Props extends PropsWithChildren {
	title?: string;
	showByDefault?: boolean;
}

const NavGroup = ({ title, showByDefault, children }: Props) => {
	const hasTitle = !!title;
	const alwaysShowChildren = !hasTitle;

	const [isToggled, setIsToggled] = useState(alwaysShowChildren || showByDefault);

	const iconRotateAmount = isToggled ? 180 : 0;

	return (
		<Wrapper>
			{hasTitle && (
				<Trigger onClick={() => setIsToggled(!isToggled)}>
					<Title>{title}</Title>
					<IconWrapper
						style={{
							transform: `rotateX(${iconRotateAmount}deg)`,
						}}
					>
						<ChevronDownIcon size={18} />
					</IconWrapper>
					<Highlight />
				</Trigger>
			)}

			{isToggled && <ChildLinks animated={hasTitle}>{children}</ChildLinks>}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  border-bottom: 1px solid ${token.var("colors.slate.100")};
  padding: 12px;
`;

const Trigger = styled(UnstyledButton)`
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${token.var("colors.slate.700")};
`;

const Title = styled.div`
  position: relative;
  z-index: 1;
  font-size: 15px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${token.var("colors.slate.500")};
`;

const IconWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const Highlight = styled.div`
  position: absolute;
  z-index: 0;
  top: 0;
  left: -12px;
  right: -12px;
  bottom: 0;
  background: ${token.var("colors.slate.50")};
  border-radius: 4px;
  opacity: 0;

  ${Trigger}:hover & {
    opacity: 1;
  }
`;

const accordionKeyframes = keyframes`
from {
  opacity: 0;
  transform: translateY(-10px);
}
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ChildLinks = styled.div<{ animated?: boolean }>`
  animation: ${(p) => (p.animated ? accordionKeyframes : "")} 200ms;
`;

export default NavGroup;
